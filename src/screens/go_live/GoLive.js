import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import { NodeCameraView } from 'react-native-nodemediaclient';
import { connect } from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import { createThumbnail } from 'react-native-create-thumbnail';
import get from 'lodash/get';

import StartPanel from './StartPanel';
import LiveStreamActionsGroup from '../../components/LiveStream/LiveStreamActionsGroup';
import MessagesList from '../../components/LiveStream/MessagesList/MessagesList';
import FloatingHearts from '../../components/LiveStream/FloatingHearts';
import Controllers from '../../components/LiveStream/Controllers/Controllers';
import Gifts from '../../components/LiveStream/Gifts';

import SocketManager from '../../utils/LiveStream/SocketManager';

import {
  LIVE_STATUS,
  videoConfig,
  audioConfig,
} from '../../utils/LiveStream/Constants';
import { Constants, GStyles, Logger } from '../../utils/Global';
import styles from './styles';
import Header from '../../components/LiveStream/Header';

const RTMP_SERVER = Constants.RTMP_SERVER;

class GoLive extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLiveStatus: LIVE_STATUS.PREPARE,
      messages: [],
      countHeart: 0,
    };
    this.bottomSheet = React.createRef();
  }

  componentDidMount() {
    this.requestCameraPermission();
    const user = this.props.user || {};
    const { id: streamerId, username: roomName } = user;
    SocketManager.instance.emitPrepareLiveStream({
      streamerId,
      roomName,
    });
    SocketManager.instance.emitJoinRoom({
      streamerId,
      userId: streamerId,
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
  }

  componentWillUnmount() {
    const user = this.props.user || {};
    const { id: streamerId } = user;
    if (this.nodeCameraViewRef) this.nodeCameraViewRef.stop();
    SocketManager.instance.emitLeaveRoom({
      streamerId,
    });
  }

  onPressGiftAction = () => {
    this.bottomSheet?.current?.open();
  };

  onPressGift = () => {
    this.bottomSheet?.current?.close();
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

  onPressSend = (message) => {
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
  };

  onPressStart = (topic) => {
    const { navigation } = this.props;
    const user = this.props.user || {};
    const { id: streamerId, username: roomName } = user;
    const { currentLiveStatus } = this.state;
    if (Number(currentLiveStatus) === Number(LIVE_STATUS.PREPARE)) {
      /**
       * Waiting live stream
       */
      SocketManager.instance.emitBeginLiveStream({
        streamerId,
        roomName,
        topic,
      });
      SocketManager.instance.emitJoinRoom({ streamerId, roomName });
      if (this.nodeCameraViewRef) this.nodeCameraViewRef.start();
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
        if (this.nodeCameraViewRef) this.nodeCameraViewRef.startPreview();
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
    const { currentLiveStatus, countHeart, messages } = this.state;
    const user = this.props.user || {};

    const { id: streamerId } = user;
    const outputUrl = `${RTMP_SERVER}/live/${streamerId}`;
    return (
      <SafeAreaView style={styles.container}>
        <NodeCameraView
          style={styles.streamerView}
          ref={this.setCameraRef}
          outputUrl={outputUrl}
          camera={{ cameraId: 0, cameraFrontMirror: true }}
          audio={audioConfig}
          video={videoConfig}
          smoothSkinLevel={3}
          autopreview={false}
        />
        {Number(currentLiveStatus) === Number(LIVE_STATUS.PREPARE) && (
          <StartPanel
            currentLiveStatus={currentLiveStatus}
            onPressStart={this.onPressStart}
          />
        )}
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Header />
          </View>
          <View style={styles.footer}>
            <MessagesList messages={messages} />
            <LiveStreamActionsGroup onPressSend={this.onPressSend} />
          </View>
          <View style={styles.controllers}>
            <Controllers
              onPressGiftAction={this.onPressGiftAction}
              onPressSwitchCamera={this.onPressSwitchCamera}
            />
          </View>
        </View>
        <RBSheet
          ref={this.bottomSheet}
          closeOnDragDown
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
          <Gifts onPressGift={this.onPressGift} />
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
