import React from 'react';
import {
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
  BackHandler,
} from 'react-native';
import { NodeCameraView } from 'react-native-nodemediaclient';
import { connect } from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import get from 'lodash/get';

import StartPanel from './StartPanel';
import BottomActionsGroup from '../../components/LiveStream/BottomActionsGroup';
import MessagesList from '../../components/LiveStream/MessagesList/MessagesList';
import FloatingHearts from '../../components/LiveStream/FloatingHearts';
import Gifts from '../../components/LiveStream/Gifts';

import SocketManager from '../../utils/LiveStream/SocketManager';

import { LIVE_STATUS, videoConfig } from '../../utils/LiveStream/Constants';
import { Constants, Helper, Logger } from '../../utils/Global';
import styles from './styles';
import Header from '../../components/LiveStream/Header';
import MessageBox from '../../components/LiveStream/BottomActionsGroup/MessageBox';

const RTMP_SERVER = Constants.RTMP_SERVER;

class GoLive extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLiveStatus: -1,
      messages: [],
      room: {},
      countHeart: 0,
      isMuted: false,
      audioConfig: {
        bitrate: 32000,
        profile: 1,
        samplerate: 44100,
      },
      lastPress: 0,
    };
    this.giftBottomSheet = React.createRef();
    this.messageBottomSheet = React.createRef();
  }

  componentDidMount() {
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
        this.setState({ room, currentLiveStatus: room?.liveStatus || 0 });
      }
    });
    SocketManager.instance.listenBeginLiveStream((data) => {
      if (data?.user === streamerId) {
        const currentLiveStatus = get(data, 'liveStatus', '');
        this.setState({ currentLiveStatus });
      }
    });
    SocketManager.instance.listenFinishLiveStream((data) => {
      if (data?.user === streamerId) {
        const currentLiveStatus = get(data, 'liveStatus', '');
        this.setState({ currentLiveStatus });
      }
    });
    SocketManager.instance.listenSendHeart(() => {
      this.setState((prevState) => ({ countHeart: prevState.countHeart + 1 }));
    });
    SocketManager.instance.listenSendMessage((message) => {
      if (message?.sender?.id !== this.props.user?.id) {
        const messages = this.state.messages || [];
        this.setState({ messages: [message].concat(messages) });
      }
    });
    SocketManager.instance.emitPrepareLiveStream({
      streamerId,
      roomName,
    });
  }

  componentWillUnmount() {
    const user = this.props.user || {};
    const { id: streamerId } = user;
    if (this.nodeCameraViewRef) this.nodeCameraViewRef.stop();
    SocketManager.instance.removePrepareLiveStream();
    SocketManager.instance.removeBeginLiveStream();
    SocketManager.instance.removeFinishLiveStream();
    SocketManager.instance.removeSendHeart();
    SocketManager.instance.removeSendMessage();
    SocketManager.instance.emitFinishLiveStream({ streamerId });
    SocketManager.instance.emitLeaveRoom({
      streamerId,
    });
    SocketManager.instance.disconnect();
  }

  onPressGiftAction = () => {
    this.giftBottomSheet?.current?.open();
  };

  onPressMessageAction = () => {
    this.messageBottomSheet?.current?.open();
  };

  onPressShareAction = async () => {
    const { room } = this.state;
    const { user } = this.props;
    Helper.inviteToLiveStream(room, user);
  };

  onPressSendHeart = () => {
    this.giftBottomSheet?.current?.close();
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
          type: 1,
        },
      ].concat(messages),
    });
    this.messageBottomSheet?.current?.close();
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
    }
    return true;
  };

  onPressStart = (topic, thumbnail) => {
    const { navigation } = this.props;
    const user = this.props.user || {};
    const { id: streamerId, username: roomName } = user;
    const { currentLiveStatus } = this.state;
    if (currentLiveStatus === -1) {
      alert('Error while initializing live.');
      return;
    }
    if (Number(currentLiveStatus) === Number(LIVE_STATUS.PREPARE)) {
      /**
       * Waiting live stream
       */
      SocketManager.instance.emitBeginLiveStream({
        streamerId,
        roomName,
        topic,
        thumbnail,
      });
      console.log(this.nodeCameraViewRef);
      if (this.nodeCameraViewRef) {
        this.nodeCameraViewRef.startPreview();
        this.nodeCameraViewRef.start();
      }
    } else if (Number(currentLiveStatus) === Number(LIVE_STATUS.ON_LIVE)) {
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
    const {
      currentLiveStatus,
      countHeart,
      messages,
      audioConfig,
      isMuted,
    } = this.state;
    const user = this.props.user || {};

    const { id: streamerId } = user;
    const outputUrl = `${RTMP_SERVER}/live/${streamerId}`;

    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={this.onDoubleTap}
        >
          <NodeCameraView
            style={styles.streamerView}
            ref={this.setCameraRef}
            outputUrl={outputUrl}
            camera={{ cameraId: 0, cameraFrontMirror: true }}
            audio={audioConfig}
            video={videoConfig}
            scaleMode={'ScaleAspectFit'}
            smoothSkinLevel={3}
            autopreview={false}
          />

          {(currentLiveStatus === LIVE_STATUS.PREPARE ||
            currentLiveStatus === -1) && (
            <StartPanel
              currentLiveStatus={currentLiveStatus}
              onPressStart={this.onPressStart}
              onPressClose={this.onPressClose}
            />
          )}
          <View style={styles.contentWrapper}>
            <View style={styles.header}>
              <Header
                streamer={user}
                liveStatus={currentLiveStatus}
                mode="streamer"
                onPressClose={this.onPressClose}
              />
            </View>
            <View style={styles.footer}>
              <MessagesList messages={messages} />
              <BottomActionsGroup
                onPressSendHeart={this.onPressSendHeart}
                onPressGiftAction={this.onPressGiftAction}
                onPressSwitchCamera={this.onPressSwitchCamera}
                onPressSwitchAudio={this.onPressSwitchAudio}
                onPressMessageAction={this.onPressMessageAction}
                onPressShareAction={this.onPressShareAction}
                mode="streamer"
                isMuted={isMuted}
              />
            </View>
          </View>
        </TouchableOpacity>

        <RBSheet
          ref={this.giftBottomSheet}
          closeOnDragDown={false}
          openDuration={250}
          customStyles={{
            container: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              backgroundColor: 'rgba(0, 0, 0, 0.32)',
            },
            wrapper: {
              backgroundColor: 'transparent',
            },
            draggableIcon: {
              width: 0,
            },
          }}
        >
          <Gifts />
        </RBSheet>
        <RBSheet
          ref={this.messageBottomSheet}
          closeOnDragDown
          openDuration={250}
          height={100}
          customStyles={{
            container: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              paddingHorizontal: 16,
              paddingBottom: 16,
              justifyContent: 'center',
              alignItems: 'center',
            },
            wrapper: {
              backgroundColor: 'transparent',
            },
            draggableIcon: {
              width: 0,
              height: 0,
            },
          }}
        >
          <MessageBox onPressSendMessage={this.onPressSendMessage} />
        </RBSheet>
        <FloatingHearts count={countHeart} />
      </SafeAreaView>
    );
  }
}

export default connect(
  (state) => ({
    user: state.me.user,
  }),
  {},
)(GoLive);
