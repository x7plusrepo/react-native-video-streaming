import React, { Component } from 'react';
import { View, SafeAreaView } from 'react-native';
import get from 'lodash/get';
import { NodePlayerView } from 'react-native-nodemediaclient';
import moment from 'moment';
import SocketManager from '../../utils/LiveStream/SocketManager';
import styles from './styles';
import BottomActionsGroup from '../../components/LiveStream/BottomActionsGroup';
import MessagesList from '../../components/LiveStream/MessagesList/MessagesList';
import FloatingHearts from '../../components/LiveStream/FloatingHearts';
import { LIVE_STATUS } from '../../utils/LiveStream/Constants';
import { Constants, Helper, Logger, RestAPI } from '../../utils/Global';
import { connect } from 'react-redux';
import Gifts from '../../components/LiveStream/Gifts';
import RBSheet from 'react-native-raw-bottom-sheet';
import Header from '../../components/LiveStream/Header';
import Controllers from '../../components/LiveStream/SideActionsGroup/SideActionsGroup';
const RTMP_SERVER = Constants.RTMP_SERVER;

class ViewLive extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      countHeart: 0,
      inputUrl: null,
      liveStatus: LIVE_STATUS.PREPARE,
      room: {},
      isJoined: false,
    };
    this.bottomSheet = React.createRef();
  }

  componentDidMount() {
    const { route } = this.props;
    const roomId = get(route, 'params.roomId');

    const params = {
      roomId,
    };
    showForcePageLoader(true);

    RestAPI.get_liveStream(params, (json, err) => {
      showForcePageLoader(false);
      if (err || json?.status !== 200 || !json?.data) {
        alert('Error while loading the stream.');
      } else if (json?.status === 200) {
        const room = json?.data || {};
        const { liveStatus } = room;
        this.setState({ liveStatus, room }, this.init);
      }
    });
  }

  init = () => {
    const { user } = this.props;
    const { room } = this.state;
    const userId = user?.id;
    const streamerId = room?.user?.id;

    SocketManager.instance.connect();
    SocketManager.instance.emitJoinRoom({
      streamerId,
      userId,
    });
    SocketManager.instance.listenBeginLiveStream((room) => {
      console.log(room);
      this.setState({ liveStatus: room?.liveStatus || 1 });
    });
    SocketManager.instance.listenPrepareLiveStream((room) => {
      console.log(room);
      this.setState({ liveStatus: room?.liveStatus || 0 });
    });
    SocketManager.instance.listenFinishLiveStream(() => {
      this.setState({ liveStatus: LIVE_STATUS.FINISH });
    });
    // if (liveStatus === LIVE_STATUS.FINISH) {
    //   SocketManager.instance.emitReplay({
    //     userId,
    //     streamerId,
    //   });
    //   SocketManager.instance.listenReplay((data) => {
    //     const { beginAt, messages } = data;
    //     const start = moment(beginAt);
    //     for (let i = 0; i < messages.length; i += 1) {
    //       ((j, that) => {
    //         const end = moment(messages[j].createdAt);
    //         const duration = end.diff(start);
    //         setTimeout(() => {
    //           that.setState((prevState) => ({
    //             messages: [...prevState.messages, messages[j]],
    //           }));
    //         }, duration);
    //       })(i, this);
    //     }
    //   });
    //   const inputUrl = `${RTMP_SERVER}/live/${streamerId}/replayFor${userId}`;
    //   this.setState({ inputUrl });
    // }
  };

  onPressJoin = () => {
    const { room } = this.state;
    const streamerId = room?.user?.id;

    this.setState({
      inputUrl: `${RTMP_SERVER}/live/${streamerId}`,
      isJoined: true,
    });
    SocketManager.instance.listenSendHeart(() => {
      if (this.state.isJoined) {
        this.setState((prevState) => ({
          countHeart: prevState.countHeart + 1,
        }));
      }
    });
    SocketManager.instance.listenSendMessage((message) => {
      if (message?.sender?.id !== this.props.user?.id && this.state.isJoined) {
        const messages = this.state.messages || [];
        this.setState({ messages: [message].concat(messages) });
      }
    });
  };

  onLeave = () => {
    if (this.nodePlayerView) this.nodePlayerView.stop();
    this.setState({
      messages: [],
      countHeart: 0,
      inputUrl: null,
      isJoined: false,
    });
    this.removeListenersForLeave();
  };

  removeListenersForLeave = () => {
    SocketManager.instance.removeSendMessage();
    SocketManager.instance.removeSendHeart();
  };

  removeListenersForExit = () => {
    const { user } = this.props;
    const { room } = this.state;
    const userId = user?.id;
    const streamerId = room?.user?.id;

    SocketManager.instance.removePrepareLiveStream();
    SocketManager.instance.removeBeginLiveStream();
    SocketManager.instance.removeFinishLiveStream();
    SocketManager.instance.emitLeaveRoom({
      streamerId,
      userId,
    });
    SocketManager.instance.disconnect();
  };

  componentWillUnmount() {
    this.onLeave();
    this.removeListenersForExit();
  }

  onPressGiftAction = () => {
    this.bottomSheet?.current?.open();
  };

  onPressGift = () => {
    this.bottomSheet?.current?.close();
    const userId = this.props.user?.id;

    SocketManager.instance.emitSendHeart({
      streamerId: this.state.room?.user?.id,
      userId,
    });
  };

  onPressSend = (message) => {
    if (!message) return;

    const { isJoined } = this.state;

    if (!isJoined) {
      return;
    }
    SocketManager.instance.emitSendMessage({
      streamerId: this.state.room?.user?.id,
      userId: this.props.user?.id,
      message,
    });
    const messages = this.state.messages || [];
    this.setState({
      messages: [
        {
          message,
          sender: this.props.user,
          type: 1,
        },
      ].concat(messages),
    });
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

  render() {
    const { liveStatus, countHeart, messages, isJoined } = this.state;
    const streamer = this.state.room?.user || {};

    return (
      <SafeAreaView style={styles.container}>
        {this.renderNodePlayerView()}
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Header streamer={streamer} liveStatus={liveStatus} />
          </View>
          <View style={styles.footer}>
            <MessagesList messages={messages} />
            <BottomActionsGroup
              onPressSend={this.onPressSend}
              onPressJoin={this.onPressJoin}
              onExit={this.onLeave}
              isJoined={isJoined}
              mode="viewer"
            />
          </View>
          <View style={styles.controllers}>
            <Controllers
              onPressGiftAction={this.onPressGiftAction}
              mode="viewer"
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
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
)(ViewLive);
