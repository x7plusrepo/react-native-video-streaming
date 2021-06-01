import React, { Component } from 'react';
import { StatusBar, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { NodePlayerView } from 'react-native-nodemediaclient';
import RBSheet from 'react-native-raw-bottom-sheet';

import SocketManager from '../../utils/LiveStream/SocketManager';
import BottomActionsGroup from '../../components/LiveStream/BottomActionsGroup';
import FloatingHearts from '../../components/LiveStream/FloatingHearts';
import Gifts from '../../components/LiveStream/Gifts';
import Header from '../../components/LiveStream/Header';
import MessageBox from '../../components/LiveStream/BottomActionsGroup/MessageBox';
import { setGifts } from '../../redux/liveStream/actions';
import { LIVE_STATUS } from '../../utils/LiveStream/Constants';
import { Constants, Helper, Global, RestAPI } from '../../utils/Global';
import styles from './styles';
import CountDownAnimation from '../../components/LiveStream/Gifts/CountDownAnimation';

const RTMP_SERVER = Constants.RTMP_SERVER;

class ViewLive extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      inputUrl: null,
      room: {},
      countHeart: 0,
      isJoined: false,
      lastPress: 0,
    };
    this.giftBottomSheet = React.createRef();
    this.messageBottomSheet = React.createRef();
  }

  componentDidMount() {
    const { route } = this.props;
    const roomId = get(route, 'params.roomId');

    const params = {
      roomId,
      userId: this.props.user?.id,
    };
    showForcePageLoader(true);

    RestAPI.get_liveStream(params, (json, err) => {
      showForcePageLoader(false);
      if (err || json?.status !== 200 || !json?.data) {
        alert('Error while loading the stream.');
      } else if (json?.status === 200) {
        const room = json?.data || {};
        this.setState({ room }, this.init);
      }
    });
    RestAPI.get_gifts({ userId: this.props.user?.id }, (json, error) => {
      if (json?.status === 200 || json?.data) {
        this.props.setGifts(json.data.gifts || []);
      }
    });
  }

  init = () => {
    const { user } = this.props;
    const { room } = this.state;
    const userId = user?.id;
    const streamerId = room?.user?.id;

    SocketManager.instance.emitJoinRoom({
      streamerId,
      userId,
    });
    SocketManager.instance.listenBeginLiveStream((newRoom) => {
      if (newRoom?.id === room?.id)
        this.setState((prevState) => ({
          room: {
            ...prevState?.room,
            liveStatus: newRoom?.liveStatus || 1,
          },
        }));
    });
    SocketManager.instance.listenPrepareLiveStream((newRoom) => {
      if (newRoom?.d === room?.id) {
        this.setState((prevState) => ({
          room: {
            ...prevState?.room,
            liveStatus: newRoom?.liveStatus || 0,
          },
        }));
      }
    });
    SocketManager.instance.listenFinishLiveStream(() => {
      this.setState((prevState) => ({
        room: {
          ...prevState?.room,
          liveStatus: LIVE_STATUS.FINISH,
        },
      }));
    });
    this.onPressJoin();
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

    SocketManager.instance.listenSendHeart((data) => {
      const newRoom = data?.room;
      if (newRoom) {
        this.setState((prevState) => ({
          room: newRoom,
          countHeart: prevState.countHeart + 1,
        }));
      }
    });

    SocketManager.instance.listenSendMessage((data) => {
      const { message, room: newRoom } = data;
      if (message && message?.sender?.id !== this.props.user?.id) {
        const messages = this.state.messages || [];
        this.setState({ messages: [message].concat(messages) });
      }
      if (newRoom) {
        this.setState({ room: newRoom });
      }
    });

    SocketManager.instance.listenSendGift((data) => {
      const { gift, room: newRoom, senderName, senderId } = data;
      if (senderId !== this.props.user?.id && gift) {
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
      if (newRoom) {
        this.setState({ room: newRoom });
      }
    });
  };

  onLeave = () => {
    if (this.nodePlayerView) this.nodePlayerView.stop();
    this.setState({
      messages: [],
      inputUrl: null,
      isJoined: false,
      room: null,
    });
    this.removeListenersForLeave();
  };

  removeListenersForLeave = () => {
    SocketManager.instance.removeSendMessage();
    SocketManager.instance.removeSendHeart();
    SocketManager.instance.removeSendGift();
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
    //SocketManager.instance.disconnect();
  };

  componentWillUnmount() {
    this.onLeave();
    this.removeListenersForExit();
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
    Global.inviteToLiveStream(room, user);
  };

  onPressSendHeart = () => {
    const userId = this.props.user?.id;
    const { room } = this.state;
    console.log(this.state.room?.user?.id, '---xxx');
    console.log(userId, '---xxx');
    SocketManager.instance.emitSendHeart({
      streamerId: this.state.room?.user?.id,
      userId,
    });
  };

  onPressSendGift = (gift) => {
    const user = this.props.user || {};
    const { room } = this.state;
    this.giftBottomSheet?.current?.close();
    SocketManager.instance.emitSendGift({
      streamerId: room?.user?.id,
      userId: user?.id,
      giftId: gift?.id,
    });
    const message = {
      message: `Sent a ${gift.name}`,
      giftIcon: gift.icon,
      sender: {
        username: user?.username,
      },
    };
    const messages = this.state.messages || [];
    this.setState({ messages: [message].concat(messages) });
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
    this.messageBottomSheet?.current?.close();

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
        //scaleMode="ScaleAspectFit"
        bufferTime={300}
        maxBufferTime={1000}
        autoplay
      />
    );
  };

  render() {
    const { messages, isJoined, countHeart } = this.state;
    const room = this.state.room || {};
    const liveStatus = room?.liveStatus || 0;
    const gifts = this.props.gifts || [];

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={this.onDoubleTap}
        >
          {this.renderNodePlayerView()}
          <View style={styles.contentWrapper}>
            <View style={styles.header}>
              <Header room={room} liveStatus={liveStatus} />
            </View>
            <View style={styles.footer}>
              <BottomActionsGroup
                onPressJoin={this.onPressJoin}
                onExit={this.onLeave}
                onPressSendHeart={this.onPressSendHeart}
                onPressGiftAction={this.onPressGiftAction}
                onPressMessageAction={this.onPressMessageAction}
                onPressShareAction={this.onPressShareAction}
                isJoined={isJoined}
                liveStatus={liveStatus}
                mode="viewer"
                messages={messages}
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
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              height: 360,
            },
            wrapper: {
              backgroundColor: 'transparent',
            },
            draggableIcon: {
              width: 0,
              height: 0,
              padding: 0,
              margin: 0,
            },
          }}
        >
          <Gifts gifts={gifts} onPressSendGift={this.onPressSendGift} />
        </RBSheet>
        <RBSheet
          ref={this.messageBottomSheet}
          closeOnDragDown
          openDuration={250}
          height={60}
          customStyles={{
            container: {
              borderRadius: 32,
              paddingHorizontal: 16,
              paddingBottom: 16,
              backgroundColor: 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            },
            wrapper: {
              backgroundColor: 'transparent',
            },
            draggableIcon: {
              width: 0,
              height: 0,
              padding: 0,
              margin: 0,
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
    user: state.me?.user || {},
    gifts: state.liveStream?.gifts || [],
  }),
  { setGifts },
)(ViewLive);
