import React from 'react';
import PropTypes from 'prop-types';
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
import get from 'lodash/get';

import LiveStreamActionButton from './LiveStreamActionButton';
import ChatInputGroup from '../../components/ChatInputGroup';
import MessagesList from '../../components/MessagesList/MessagesList';
import FloatingHearts from '../../components/FloatingHearts';

import SocketManager from '../../utils/LiveStream/SocketManager';

import {
  LIVE_STATUS,
  videoConfig,
  audioConfig,
} from '../../utils/LiveStream/Constants';
import { Constants, Logger } from '../../utils/Global';
import styles from './styles';

const RTMP_SERVER = Constants.RTMP_SERVER;

class GoLive extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLiveStatus: LIVE_STATUS.PREPARE,
      messages: [],
      countHeart: 0,
      isVisibleMessages: true,
    };
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
      userId: streamerId
    });
    // SocketManager.instance.listenListLiveStream((data) => {
    //   alert(JSON.stringify(data))
    // });
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
    SocketManager.instance.listenSendMessage((data) => {
      this.setState({ messages: data });
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

  onPressHeart = () => {
    const user = this.props.user || {};
    const { id: streamerId } = user;
    SocketManager.instance.emitSendHeart({
      streamerId,
      userId: streamerId,
    });
  };

  onPressSend = (message) => {
    const user = this.props.user || {};
    const { id: streamerId } = user;
    SocketManager.instance.emitSendMessage({
      streamerId,
      message,
      userId: streamerId,
    });
    this.setState({ isVisibleMessages: true });
  };

  onEndEditing = () => this.setState({ isVisibleMessages: true });

  onFocusChatGroup = () => {
    this.setState({ isVisibleMessages: false });
  };

  onPressClose = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  onPressLiveStreamButton = () => {
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

  renderChatGroup = () => {
    return (
      <ChatInputGroup
        onPressHeart={this.onPressHeart}
        onPressSend={this.onPressSend}
        onFocus={this.onFocusChatGroup}
        onEndEditing={this.onEndEditing}
      />
    );
  };

  renderListMessages = () => {
    const { messages, isVisibleMessages } = this.state;
    if (!isVisibleMessages) return null;
    return <MessagesList messages={messages} />;
  };

  setCameraRef = (ref) => {
    this.nodeCameraViewRef = ref;
  };

  render() {
    const { currentLiveStatus, countHeart } = this.state;
    const user = this.props.user || {};
    const { id: streamerId } = user;
    const outputUrl = `${RTMP_SERVER}/live/${streamerId}`;
    return (
      <SafeAreaView style={styles.container}>
        <NodeCameraView
          style={styles.streamerView}
          ref={this.setCameraRef}
          outputUrl={outputUrl}
          camera={{ cameraId: 1, cameraFrontMirror: true }}
          audio={audioConfig}
          video={videoConfig}
          smoothSkinLevel={3}
          autopreview={false}
        />
        <SafeAreaView style={styles.contentWrapper}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.btnClose}
              onPress={this.onPressClose}
            >
              <Image
                style={styles.icoClose}
                source={require('../../assets/images/ic_close.png')}
                tintColor="white"
              />
            </TouchableOpacity>
            <LiveStreamActionButton
              currentLiveStatus={currentLiveStatus}
              onPress={this.onPressLiveStreamButton}
            />
          </View>
          <View style={styles.center} />
          <View style={styles.footer}>
            {this.renderChatGroup()}
            {this.renderListMessages()}
          </View>
        </SafeAreaView>
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

GoLive.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func,
  }),
  route: PropTypes.shape({}),
};

GoLive.defaultProps = {
  navigation: {
    goBack: null,
  },
  route: null,
};
