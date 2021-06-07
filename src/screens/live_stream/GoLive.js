import React from 'react';
import {
  Alert,
  BackHandler,
  Image,
  PermissionsAndroid,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';
import { NodeCameraView } from 'react-native-nodemediaclient';
import { connect } from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';

import StartPanel from './StartPanel';
import BottomActionsGroup from '../../components/LiveStream/BottomActionsGroup';
import FloatingHearts from '../../components/LiveStream/FloatingHearts';
import Header from '../../components/LiveStream/Header';
import MessageBox from '../../components/LiveStream/BottomActionsGroup/MessageBox';
import TaskInput from '../../components/LiveStream/BottomActionsGroup/TaskInput';

import SocketManager from '../../utils/LiveStream/SocketManager';
import { LIVE_STATUS } from '../../utils/LiveStream/Constants';
import { Constants, Global, Logger, RestAPI } from '../../utils/Global';
import { setGifts } from '../../redux/liveStream/actions';
import styles from './styles';
import ic_audio from './../../assets/images/Icons/ic_audio_on.png';
import ProfileBottom from '../../components/LiveStream/ProfileBottom/ProfileBottom';

const RTMP_SERVER = Constants.RTMP_SERVER;

class GoLive extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      room: {},
      isMuted: false,
      audioConfig: {
        bitrate: 32000,
        profile: 1,
        samplerate: 44100,
      },
      videoConfig: {
        preset: 1,
        bitrate: 500000,
        profile: 1,
        fps: 15,
        videoFrontMirror: false,
      },
      lastPress: 0,
      goal: 0,
    };
    this.messageBottomSheet = React.createRef();
    this.taskBottomSheet = React.createRef();
    this.profileSheet = React.createRef();
  }

  componentDidMount() {
    this.init();
    BackHandler.addEventListener('hardwareBackPress', this.onPressClose);
  }

  init = () => {
    this.requestCameraPermission();
    const user = this.props.user || {};
    const { id: streamerId, username: roomName } = user;
    SocketManager.instance.connect();
    SocketManager.instance.emitJoinRoom({
      streamerId,
      userId: streamerId,
    });

    SocketManager.instance.listenPrepareLiveStream((room) => {
      if (streamerId === room?.user) {
        this.setState({
          room: {
            ...room,
            user: this.props.user || {},
            countHeart: 0,
          },
        });
      }
    });

    SocketManager.instance.listenBeginLiveStream((room) => {
      if (room?.user === streamerId) {
        this.setState((prevState) => ({
          room: {
            ...prevState?.room,
            liveStatus: room?.liveStatus || 1,
            mode: room?.mode || 0,
          },
        }));
      }
    });
    SocketManager.instance.listenFinishLiveStream((data) => {
      if (data?.user === streamerId) {
        this.setState((prevState) => ({
          room: {
            ...prevState?.room,
            liveStatus: LIVE_STATUS.FINISH,
          },
        }));
      }
    });
    SocketManager.instance.listenSendHeart((data) => {
      const room = data?.room;
      if (room) {
        this.setState((prevState) => ({
          room,
          countHeart: prevState.countHeart + 1,
        }));
      }
    });
    SocketManager.instance.listenSendMessage((data) => {
      const { message, room } = data;
      if (message && message?.sender?.id !== this.props.user?.id) {
        const messages = this.state.messages || [];
        this.setState({ messages: [message].concat(messages) });
      }
      if (room) {
        this.setState({ room });
      }
    });
    SocketManager.instance.listenSendGift((data) => {
      const { gift, room, senderName } = data;
      if (gift) {
        const message = {
          message: `Sent a ${gift.name}`,
          giftIcon: gift.icon,
          sender: {
            username: senderName,
          },
        };
        const messages = this.state.messages || [];
        this.setState({ messages: [message].concat(messages) });
      }
      if (room) {
        this.setState({ room });
      }
    });
    SocketManager.instance.emitPrepareLiveStream({
      streamerId,
      roomName,
    });
    RestAPI.get_gifts({ userId: this.props.user?.id }, (json, error) => {
      if (json?.status === 200 || json?.data) {
        this.props.setGifts(json.data.gifts || []);
      }
    });
  };

  componentWillUnmount() {
    const user = this.props.user || {};
    const { id: streamerId } = user;
    if (this.nodeCameraViewRef) this.nodeCameraViewRef.stop();
    SocketManager.instance.removePrepareLiveStream();
    SocketManager.instance.removeBeginLiveStream();
    SocketManager.instance.removeFinishLiveStream();
    SocketManager.instance.removeSendHeart();
    SocketManager.instance.removeSendMessage();
    SocketManager.instance.removeSendGift();
    SocketManager.instance.emitFinishLiveStream({ streamerId });
    SocketManager.instance.emitLeaveRoom({
      userId: streamerId,
      streamerId,
    });
    BackHandler.removeEventListener('hardwareBackPress', this.onPressClose);
  }

  onPressMessageAction = () => {
    this.messageBottomSheet?.current?.open();
  };

  onPressShareAction = async () => {
    const { room } = this.state;
    const { user } = this.props;
    Global.inviteToLiveStream(room, user);
  };

  onPressTaskAction = () => {
    this.taskBottomSheet?.current?.open();
  };

  onPressProfileAction = (user) => {
    global._opponentUser = user || {};
    this.profileSheet?.current?.open();
  };

  onPressSendHeart = () => {
    const user = this.props.user || {};
    const { id: streamerId } = user;
    SocketManager.instance.emitSendHeart({
      streamerId,
      userId: streamerId,
    });
  };

  onPressSwitchCamera = () => {
    this.nodeCameraViewRef.switchCamera();
  };

  onPressSwitchAudio = () => {
    const { isMuted } = this.state;
    this.setState({
      // audioConfig: {
      //   bitrate: isMuted ? 32000 : 0,
      //   profile: 1,
      //   samplerate: 44100,
      // },
      isMuted: !isMuted,
    });
  };

  onDoubleTap = () => {
    const delta = new Date().getTime() - this.state.lastPress;

    if (delta < 300) {
      this.onPressSendHeart();
    }

    this.setState({
      lastPress: new Date().getTime(),
    });
  };

  onPressSendMessage = (message) => {
    if (!message) return;
    const user = this.props.user || {};
    const { id: streamerId } = user;
    SocketManager.instance.emitSendMessage({
      streamerId,
      message,
      userId: streamerId,
    });
    const messages = this.state.messages || [];
    this.setState({
      messages: [
        {
          message,
          sender: user,
          messageType: 1,
        },
      ].concat(messages),
    });
    this.messageBottomSheet?.current?.close();
  };

  onCloseProfileSheet = () => {
    this.profileSheet?.current?.close();
  };

  onPressClose = () => {
    if (this.props.navigation.isFocused()) {
      Alert.alert(Constants.WARNING_TITLE, 'Stop broadcast?', [
        {
          text: 'NO',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'YES', onPress: () => this.props.navigation.goBack() },
      ]);
      return true;
    }
    return false;
  };

  onPressStart = (topic, thumbnail, mode) => {
    const { navigation } = this.props;
    const user = this.props.user || {};
    const { id: streamerId, username: roomName } = user;
    const liveStatus = this.state.room?.liveStatus || 0;
    if (liveStatus === -1) {
      alert('Error while initializing live.');
      return;
    }
    if (Number(liveStatus) === Number(LIVE_STATUS.PREPARE)) {
      /**
       * Waiting live stream
       */
      SocketManager.instance.emitBeginLiveStream({
        streamerId,
        roomName,
        topic,
        thumbnail,
        mode,
      });
      if (this.nodeCameraViewRef) {
        this.nodeCameraViewRef.startPreview();
        this.nodeCameraViewRef.start();
      }
    } else if (Number(liveStatus) === Number(LIVE_STATUS.ON_LIVE)) {
      /**
       * Finish live stream
       */
      SocketManager.instance.emitFinishLiveStream({
        streamerId,
      });
      if (this.nodeCameraViewRef) this.nodeCameraViewRef.stop();
      Alert.alert(
        'Alert ',
        'Thanks for your live stream',
        [
          {
            text: 'Okay',
            onPress: () => {
              navigation.goBack();
              SocketManager.instance.emitLeaveRoom({
                streamerId,
                userId: streamerId,
              });
            },
          },
        ],
        { cancelable: false },
      );
    }
  };

  requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ],
        {
          title: 'LiveStreamExample need Camera And Microphone Permission',
          message:
            'LiveStreamExample needs access to your camera so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (
        granted['android.permission.CAMERA'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        //if (this.nodeCameraViewRef) this.nodeCameraViewRef.startPreview();
      } else {
        Logger.log('Camera permission denied');
      }
    } catch (err) {
      Logger.warn(err);
    }
  };

  setCameraRef = (ref) => {
    this.nodeCameraViewRef = ref;
  };

  render() {
    const { messages, audioConfig, videoConfig, isMuted, room, goal } =
      this.state;
    const user = this.props.user || {};
    const countHeart = room?.countHeart || 0;
    const liveStatus = room?.liveStatus || 0;
    const mode = room?.mode || 0;

    const { id: streamerId } = user;
    const outputUrl = `${RTMP_SERVER}/live/${streamerId}`;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={this.onDoubleTap}
        >
          <NodeCameraView
            style={[styles.streamerView, mode === 1 && { width: 0, height: 0 }]}
            ref={this.setCameraRef}
            outputUrl={outputUrl}
            camera={{ cameraId: 0, cameraFrontMirror: true }}
            audio={audioConfig}
            video={videoConfig}
            scaleMode={'ScaleAspectFit'}
            smoothSkinLevel={3}
            autopreview={false}
          />
          {liveStatus === LIVE_STATUS.ON_LIVE && mode === 1 && (
            <View style={styles.audioLiveContainer}>
              <Image source={ic_audio} style={{ width: 24, height: 24 }} />
            </View>
          )}

          {(liveStatus === LIVE_STATUS.PREPARE || liveStatus === -1) && (
            <StartPanel
              liveStatus={liveStatus}
              onPressStart={this.onPressStart}
              onPressClose={this.onPressClose}
            />
          )}
          <View style={styles.contentWrapper}>
            <View style={styles.header}>
              <Header
                room={room}
                liveStatus={liveStatus}
                mode="streamer"
                goal={goal}
                onPressClose={this.onPressClose}
                onPressProfileAction={this.onPressProfileAction}
              />
            </View>
            <View style={styles.footer}>
              <BottomActionsGroup
                onPressSendHeart={this.onPressSendHeart}
                onPressSwitchCamera={this.onPressSwitchCamera}
                onPressSwitchAudio={this.onPressSwitchAudio}
                onPressMessageAction={this.onPressMessageAction}
                onPressShareAction={this.onPressShareAction}
                onPressTaskAction={this.onPressTaskAction}
                mode="streamer"
                isMuted={isMuted}
                messages={messages}
              />
            </View>
          </View>
        </TouchableOpacity>
        <RBSheet
          ref={this.messageBottomSheet}
          closeOnDragDown
          openDuration={250}
          height={60}
          customStyles={{
            container: styles.sheetCommonContainer,
            wrapper: styles.sheetWrapper,
            draggableIcon: styles.sheetDragIcon,
          }}
        >
          <MessageBox onPressSendMessage={this.onPressSendMessage} />
        </RBSheet>
        <RBSheet
          ref={this.taskBottomSheet}
          closeOnDragDown
          openDuration={250}
          customStyles={{
            container: styles.sheetCommonContainer,
            wrapper: styles.sheetWrapper,
            draggableIcon: styles.sheetDragIcon,
          }}
        >
          <TaskInput />
        </RBSheet>
        <RBSheet
          ref={this.profileSheet}
          closeOnDragDown
          openDuration={250}
          customStyles={{
            container: {
              backgroundColor: 'rgba(0, 0, 0, 0)',
              height: 420,
              overflow: 'visible',
            },
            wrapper: styles.sheetWrapper,
            draggableIcon: styles.sheetDragIcon,
          }}
        >
          <ProfileBottom onCloseProfileSheet={this.onCloseProfileSheet} />
        </RBSheet>
        <FloatingHearts count={countHeart} />
      </SafeAreaView>
    );
  }
}

export default connect(
  (state) => ({
    user: state.me.user,
    gifts: state.liveStream?.gifts || [],
  }),
  { setGifts },
)(GoLive);
