import React, { Component } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import get from 'lodash/get';
import { NodePlayerView } from 'react-native-nodemediaclient';
import moment from 'moment';
import SocketManager from '../../utils/LiveStream/SocketManager';
import styles from './styles';
import LiveStreamActionsGroup from '../../components/LiveStream/LiveStreamActionsGroup';
import MessagesList from '../../components/LiveStream/MessagesList/MessagesList';
import FloatingHearts from '../../components/LiveStream/FloatingHearts';
import { LIVE_STATUS } from '../../utils/LiveStream/Constants';
import { Constants, Logger } from '../../utils/Global';
import { connect } from 'react-redux';
const RTMP_SERVER = Constants.RTMP_SERVER;

class ViewLive extends Component {
  constructor(props) {
    super(props);
    this.Animation = new Animated.Value(0);
    const { route } = props;
    const room = get(route, 'params.room');
    const liveStatus = get(room, 'liveStatus', LIVE_STATUS.PREPARE);
    const streamerId = get(room, 'user', '');
    this.state = {
      messages: [],
      countHeart: 0,
      isVisibleMessages: true,
      inputUrl: null,
    };
    this.streamerId = streamerId;
    this.liveStatus = liveStatus;
    this.timeout = null;
  }

  componentDidMount() {
    const { navigation, user } = this.props;
    const userId = user?.id;
    const streamerId = this.streamerId;
    /**
     * Just for replay
     */
    if (this.liveStatus === LIVE_STATUS.FINISH) {
      SocketManager.instance.emitReplay({
        userId,
        streamerId,
      });
      SocketManager.instance.listenReplay((data) => {
        const { beginAt, messages } = data;
        const start = moment(beginAt);
        for (let i = 0; i < messages.length; i += 1) {
          ((j, that) => {
            const end = moment(messages[j].createdAt);
            const duration = end.diff(start);
            setTimeout(() => {
              that.setState((prevState) => ({
                messages: [...prevState.messages, messages[j]],
              }));
            }, duration);
          })(i, this);
        }
      });
      const inputUrl = `${RTMP_SERVER}/live/${this.streamerId}/replayFor${this.userId}`;
      this.setState({ inputUrl });
    } else {
      this.setState({
        inputUrl: `${RTMP_SERVER}/live/${this.streamerId}`,
        messages: this.messages,
      });
      SocketManager.instance.emitJoinRoom({
        streamerId,
        userId,
      });
      SocketManager.instance.listenSendHeart(() => {
        this.setState((prevState) => ({
          countHeart: prevState.countHeart + 1,
        }));
      });
      SocketManager.instance.listenSendMessage((message) => {
        if (message?.sender?.id !== this.props.user?.id) {
          const messages = this.state.messages || [];
          this.setState({ messages: [message].concat(messages) });
        }
      });
      SocketManager.instance.listenFinishLiveStream(() => {
        Alert.alert(
          'Alert ',
          'Thanks for watching this live stream',
          [
            {
              text: 'Okay',
              onPress: () => navigation.goBack(),
            },
          ],
          { cancelable: false },
        );
      });
      this.startBackgroundAnimation();
    }
  }

  componentWillUnmount() {
    const streamerId = this.streamerId;
    const userId = this.props.user?.id;

    if (this.nodePlayerView) this.nodePlayerView.stop();
    SocketManager.instance.emitLeaveRoom({
      streamerId,
      userId,
    });
    this.setState({
      messages: [],
      countHeart: 0,
      isVisibleMessages: true,
      inputUrl: null,
    });
    clearTimeout(this.timeout);
  }

  startBackgroundAnimation = () => {
    this.Animation.setValue(0);
    Animated.timing(this.Animation, {
      toValue: 1,
      duration: 15000,
      useNativeDriver: false,
    }).start(() => {
      this.startBackgroundAnimation();
    });
  };

  onPressHeart = () => {
    SocketManager.instance.emitSendHeart({
      streamerId: this.streamerId,
    });
  };

  onPressSend = (message) => {
    SocketManager.instance.emitSendMessage({
      streamerId: this.streamerId,
      userId: this.props.user?.id,
      message,
    });
    const messages = this.state.messages || [];
    this.setState({
      isVisibleMessages: true,
      messages: [{
        message,
        sender: this.props.user,
        type: 1,
      }].concat(messages),
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

  renderBackgroundColors = () => {
    const backgroundColor = this.Animation.interpolate({
      inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
      outputRange: [
        '#1abc9c',
        '#3498db',
        '#9b59b6',
        '#34495e',
        '#f1c40f',
        '#1abc9c',
      ],
    });
    if (this.liveStatus === LIVE_STATUS.FINISH) return null;
    return (
      <Animated.View style={[styles.backgroundContainer, { backgroundColor }]}>
        <SafeAreaView style={styles.wrapperCenterTitle}>
          <Text style={styles.titleText}>
            Stay here and wait until start live stream you will get 30% discount
          </Text>
        </SafeAreaView>
      </Animated.View>
    );
  };

  renderNodePlayerView = () => {
    const { inputUrl } = this.state;
    if (!inputUrl) return null;
    return (
      <NodePlayerView
        style={styles.playerView}
        ref={(vb) => {
          this.nodePlayerView = vb;
        }}
        inputUrl={inputUrl}
        scaleMode="ScaleAspectFit"
        bufferTime={300}
        maxBufferTime={1000}
        autoplay
      />
    );
  };

  renderChatGroup = () => {
    return (
      <LiveStreamActionsGroup
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

  render() {
    const { countHeart } = this.state;
    /**
     * Replay mode
     */
    if (this.liveStatus === LIVE_STATUS.FINISH) {
      return (
        <View style={styles.blackContainer}>
          {this.renderNodePlayerView()}
          {this.renderListMessages()}
          <TouchableOpacity style={styles.btnClose} onPress={this.onPressClose}>
            <Image
              style={styles.icoClose}
              source={require('../../assets/images/Icons/ic_close.png')}
              tintColor="white"
            />
          </TouchableOpacity>
          <FloatingHearts count={countHeart} />
        </View>
      );
    }
    /**
     * Viewer mode
     */
    return (
      <View style={styles.container}>
        {this.renderBackgroundColors()}
        {this.renderNodePlayerView()}
        {this.renderChatGroup()}
        {this.renderListMessages()}
        <TouchableOpacity style={styles.btnClose} onPress={this.onPressClose}>
          <Image
            style={styles.icoClose}
            source={require('../../assets/images/Icons/ic_close.png')}
            tintColor="white"
          />
        </TouchableOpacity>
        <FloatingHearts count={countHeart} />
      </View>
    );
  }
}

export default connect(
  (state) => ({
    user: state.me.user,
  }),
  {},
)(ViewLive);
