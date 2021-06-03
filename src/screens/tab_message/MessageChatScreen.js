import React, { Component } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Video from 'react-native-video';
import { IconButton } from 'react-native-paper';
import { GiftedChat, Actions, Send, Bubble } from 'react-native-gifted-chat';
import Sound from 'react-native-sound';

import GHeaderBar from '../../components/GHeaderBar';
import CustomActions from '../../components/elements/MessageActions';
import CustomView from '../../components/elements/MessageView';

import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
  RestAPI,
} from '../../utils/Global';
import SocketManager from './../../utils/Message/SocketManager';
import get from 'lodash/get';

const ic_send = require('../../assets/images/Icons/ic_send.png');

class MessageChatScreen extends Component {
  constructor(props) {
    super(props);

    console.log('MessageChatScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    SocketManager.instance.removeFetchMessages();
    //SocketManager.instance.removeReceiveMessages();
  }

  init = () => {
    const { route } = this.props;
    const opponentUser = get(route, 'params.opponentUser');
    this.state = {
      isFetching: false,
      totalCount: 0,
      opponentUser,
      chatTitle: '',
      messages: [],
      typingText: null,
    };
    SocketManager.instance.listenFetchMessages(this.onFetchMessageList);
    SocketManager.instance.listenReceiveMessages(this.onReceiveMessageList);
    this.onRefresh('init');
  };

  onRefresh = (type) => {
    let { isFetching, totalCount, messages, opponentUser } = this.state;

    if (isFetching) {
      return;
    }

    const params = {
      otherId: opponentUser?.id,
      userId: global.me?.id,
    };

    if (type === 'more') {
      if (messages.length < totalCount) {
        console.log(messages[messages.length - 1]);
        params.lastMessageCreatedAt =
          messages[messages.length - 1]?.createdAt || new Date();
      } else {
        return;
      }
      this.setState({ isFetching: true });
    } else {
      showForcePageLoader(true);
    }
    SocketManager.instance.emitFetchMessages(params);
  };

  onSocketError = () => {
    showForcePageLoader(false);
    this.setState({ isFetching: false });

    Helper.alertNetworkError();
  };

  onFetchMessageList = (response) => {
    showForcePageLoader(false);
    this.setState({ isFetching: false });

    this.setState({ totalCount: response?.totalCount || 0 });
    this.onLoadMore(response?.messages);
  };

  onReceiveMessageList = (response) => {
    showForcePageLoader(false);

    const messages = response.messages || [];

    this.onReceive(messages);
  };

  onBack = () => {
    // let params = {
    //   user_id: global.me?.id,
    //   other_id: global._roomId,
    // };
    //RestAPI.set_read_status(params, (json, err) => {});

    this.props.navigation.goBack();
  };

  onSend = (messages = []) => {
    if (messages.length > 0) {
      //showForcePageLoader(true);
      SocketManager.instance.emitSendMessage({
        senderId: global.me?.id,
        receiverId: this.state?.opponentUser?.id,
        messageType: Constants.MESSAGE_TYPE_TEXT,
        roomType: 0,
        message: messages[0].text,
      });
    }
  };

  onPlaySound = (value) => {
    const track = new Sound(value, null, (e) => {
      if (e) {
        console.log('error loading track:', e);
      } else {
        track.play();
      }
    });
  };

  onReceive = (message_list = []) => {
    let messages = [];
    message_list.forEach((item) => {
      const newItem = {
        _id: item.id,
        text: item.message,
        createdAt: new Date(),
        user: {
          _id: item.sender?.id,
          name: item.sender?.username,
          avatar: item.sender?.photo,
        },
      };
      messages.push(newItem);
    });

    this.setState((oldState) => {
      return {
        messages: GiftedChat.append(oldState.messages, messages),
      };
    });
  };

  onLoadMore = (array = []) => {
    let messages = [];
    array.forEach((item) => {
      if (item.message) {
        const newItem = {
          _id: item.id,
          text: item.message,
          createdAt: new Date(item.createdAt),
          user: {
            _id: item.sender?.id,
            name: item.sender?.username,
            avatar: item.sender?.photo,
          },
        };
        messages.push(newItem);
      }
    });

    this.setState((oldState) => {
      return {
        messages: GiftedChat.prepend(oldState.messages, messages),
      };
    });
  };

  scrollToBottomComponent = () => {
    return (
      <View style={styles.bottomComponentContainer}>
        <IconButton
          icon="chevron-double-down"
          size={36}
          color={GStyle.activeColor}
        />
      </View>
    );
  };

  render() {
    return (
      <>
        <SafeAreaView style={GStyles.statusBar} />
        <SafeAreaView style={{ ...GStyles.container }}>
          {this._renderHeader()}
          {this._renderNotification()}
          {this._renderChat()}
        </SafeAreaView>
      </>
    );
  }

  _renderHeader = () => {
    const { opponentUser } = this.state;
    console.log(opponentUser);
    return (
      <GHeaderBar
        headerTitle={opponentUser?.username}
        leftType="back"
        onPressLeftButton={this.onBack}
      />
    );
  };

  _renderNotification = () => {
    const { chatTitle } = this.state;

    return (
      <View style={{ width: '88.1%' }}>
        <Text style={{ ...GStyles.regularText, fontSize: 13, marginBottom: 4 }}>
          {chatTitle}
        </Text>
      </View>
    );
  };

  _renderChat = () => {
    const { messages, isFetching, totalCount } = this.state;

    let isLoadEarlier = messages.length > 0;
    if (isLoadEarlier) {
      isLoadEarlier = messages.length < totalCount;
    }

    return (
      <View
        style={{
          flex: 1,
          width: '95%',
        }}
      >
        <GiftedChat
          messages={messages}
          onSend={this.onSend}
          loadEarlier={isLoadEarlier}
          onLoadEarlier={() => {
            this.onRefresh('more');
          }}
          isLoadingEarlier={isFetching}
          user={{ _id: global.me?.id, name: global.me?.username }}
          renderBubble={this._renderBubble}
          placeholder="Type your message here..."
          showUserAvatar
          alwaysShowSend
          renderSend={this._renderSend}
          scrollToBottom
          scrollToBottomComponent={this.scrollToBottomComponent}
          renderCustomView={this._renderCustomView}
          // renderActions={this._renderCustomActions}
          renderMessageVideo={this._renderMessageVideo}
          renderMessageAudio={this._renderMessageAudio}
          renderFooter={this._renderFooter}
        />
      </View>
    );
  };

  _renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  _renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: GStyle.grayBackColor,
          },
          right: {
            backgroundColor: GStyle.orangeColor,
          },
        }}
      />
    );
  };

  _renderSend = (props) => {
    return (
      <Send {...props}>
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 14,
          }}
        >
          <Image source={ic_send} style={{ ...GStyles.image, width: 24 }} />
        </View>
      </Send>
    );
  };

  _renderCustomView(props) {
    return <CustomView {...props} />;
  }

  _renderMessageVideo = (props) => {
    const { currentMessage } = props;
    return (
      <View
        style={{
          width: 150,
          height: 100,
          borderRadius: 13,
          overflow: 'hidden',
          margin: 3,
          borderWidth: 1,
          borderColor: 'red',
        }}
      >
        <Video
          source={{ uri: currentMessage.video, cache: true }} // Can be a URL or a local file.
          ref={(ref) => {
            this.player = ref;
          }} // Store reference
          resizeMode="cover"
          onBuffer={this.onBuffer} // Callback when remote video is buffering
          onError={this.videoError} // Callback when video cannot be loaded
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
        />
      </View>
    );
  };

  _renderMessageAudio = (props) => {
    const { currentMessage } = props;
    return (
      <View
        style={{
          width: 150,
          height: 50,
          borderRadius: 13,
          margin: 3,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'red',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            this.onPlaySound(currentMessage.audio);
          }}
        >
          <Text>Play</Text>
        </TouchableOpacity>
      </View>
    );
  };

  _renderFooter = (props) => {
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>{this.state.typingText}</Text>
        </View>
      );
    }
    return null;
  };
}

const styles = StyleSheet.create({
  footerContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
  },
  bottomComponentContainer: {},
});

export default MessageChatScreen;
