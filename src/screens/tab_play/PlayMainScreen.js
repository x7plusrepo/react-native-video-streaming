import React, { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Platform,
  StatusBar,
  View,
} from 'react-native';

import SplashScreen from 'react-native-splash-screen';
import { connect } from 'react-redux';
import RBSheet from "./../../components/react-native-raw-bottom-sheet";

import RenderPosts from "../../components/posts/RenderPosts";
import ProgressModal from '../../components/ProgressModal';

import ChatStreamSocketManager from './../../utils/Message/SocketManager';
import { setMyUserAction } from '../../redux/me/actions';

import {
  Constants,
  Global,
  GStyles,
  Helper,
  RestAPI,
} from '../../utils/Global';
import CommentsScreen from "../details/CommentsScreen";

const SHEET_HEIGHT = Helper.getWindowHeight() * 0.75;

class PlayMainScreen extends Component {
  constructor(props) {
    super(props);

    console.log('PlayMainScreen start');

    SplashScreen.hide();
    this.init();
    this.profileSheet = React.createRef();
  }

  componentDidMount() {
    this.onRefresh('init');

    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      Helper.setDarkStatusBar();
      this.checkSignin();
      this.setState({ isVideoPause: false });
    });
    this.unsubscribeBlur = this.props.navigation.addListener('blur', () => {
      this.setState({ isVideoPause: true });
      global._prevScreen = 'play_main';
    });
    BackHandler.addEventListener('hardwareBackPress', this.onBack);
  }

  componentWillUnmount() {
    this.unsubscribeFocus && this.unsubscribeFocus();
    this.unsubscribeBlur && this.unsubscribeBlur();
    BackHandler.removeEventListener('hardwareBackPress', this.onBack);
  }

  init = async () => {
    this.state = {
      isVideoLoading: false,
      isVideoPause: false,
      posts: [],
      isVisibleProgress: false,
      percent: 0,

      isFetching: false,
      totalCount: 0,
      curPage: 1,
      item: {},
      onEndReachedDuringMomentum: true,
      curIndex: null,
    };

    await Helper.setDeviceId();
    Helper.hasPermissions();
  };

  onRefresh = async (type) => {
    let { posts, isFetching, totalCount, curPage } = this.state;

    if (isFetching) {
      return;
    }

    if (type === 'more') {
      curPage += 1;
      const maxPage =
        (totalCount + Constants.COUNT_PER_PAGE - 1) / Constants.COUNT_PER_PAGE;
      if (curPage > maxPage) {
        return;
      }
    } else {
      curPage = 1;
    }
    this.setState({ curPage, onEndReachedDuringMomentum: true });

    if (type !== 'init') {
      this.setState({ isFetching: true });
    }

    const storageUsername = await Helper.getLocalValue(Constants.KEY_USERNAME);
    const storagePassword = await Helper.getLocalValue(Constants.KEY_PASSWORD);

    const guestUsername = 'guest_' + global._devId;
    const guestPassword = 'guest_' + global._devId;

    const username = storageUsername || guestUsername;
    const password = storagePassword || guestPassword;

    let params = {
      user_id: global.me ? global.me.id : '',
      page_number: type === 'more' ? curPage : '1',
      count_per_page: Constants.COUNT_PER_PAGE,
      username,
      password,
    };

    RestAPI.get_all_post_list(params, async (json, err) => {
      if (type === 'init') {
        showForcePageLoader(false);
      } else {
        this.setState({ isFetching: false });
      }

      if (err !== null) {
        Helper.alertNetworkError(err?.message);
      } else if (json?.status === 200) {
        const postList = json?.data?.postList || [];

        this.setState({ totalCount: json.data?.totalCounts || 0});
        if (type === 'more') {
          let data = posts.concat(postList);
          this.setState({ posts: data })
        } else {
          this.setState({ posts: postList });
          if (json.data?.loginResult?.user) {
            ChatStreamSocketManager.instance.emitLeaveRoom({
              roomId: global.me?.id,
              userId: global.me?.id,
            });

            global.me = json.data?.loginResult?.user || {};

            ChatStreamSocketManager.instance.emitJoinRoom({
              roomId: global.me?.id,
              userId: global.me?.id,
            });

            this.props.setMyUserAction(global.me);
            Helper.setLocalValue(Constants.KEY_USERNAME, username);
            Helper.setLocalValue(Constants.KEY_PASSWORD, password);
            Helper.setLocalValue(
              Constants.KEY_USER,
              JSON.stringify(global.me),
            );
            Helper.callFunc(global.onSetUnreadCount);
            Global.registerPushToken();
          }
        }
      } else {
        Helper.alertServerDataError();
      }
      if (type === 'init') {
        this.props.navigation.jumpTo('home');
      }
    });
  };

  onBack = () => {
    if (this.props.navigation.isFocused()) {
      Alert.alert(Constants.WARNING_TITLE, 'Are you sure to quit?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'YES', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    }

    return false;
  };

  onViewableItemsChanged = ({ changed }) => {
    if (changed.length > 0) {
      const focused = changed[0];
      const item = focused?.item || {};
      this.setState({ curIndex: focused.index });
      if (this.state.item?.id === item.id) {
        return;
      }

      this.setState({ item });
      global._opponentUser = item.user;
      let params = {
        postId: item.id,
        ownerId: item.user?.id,
        viewerId: global.me ? global.me.id : 0,
        deviceType: Platform.OS === 'ios' ? '1' : '0',
        deviceIdentifier: global._deviceId,
      };
      RestAPI.update_post_view(params, (json, err) => {});
    }
  };

  onPressAvatar = (item) => {
    const user = item?.user || {};
    if (global.me) {
      if (user.id === global.me?.id) {
        this.props.navigation.jumpTo('profile');
      } else {
        global._opponentUser = user;
        this.props.navigation.navigate('profile_other');
      }
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onPressLike = (isChecked, item) => {
    if (global.me) {
      const { posts } = this.state;
      isChecked ? item.likeCount++ : item.likeCount--;
      const params = {
        userId: global.me?.id,
        postId: item.id,
        isLiked: isChecked,
      };
      RestAPI.update_like_post(params, (json, err) => {
        showForcePageLoader(false);

        if (err !== null) {
          Helper.alertNetworkError(err?.message);
        } else {
          if (json.status === 200) {
            item.isLiked = isChecked;
            this.setState({ posts });
          } else {
            Helper.alertServerDataError();
          }
        }
      });
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onPressMessage = (item) => {
    const user = item?.user || {};

    if (global.me) {
      if (user.id !== global.me?.id) {
        this.props.navigation.navigate('message_chat', {
          opponentUser: item?.user || {},
        });
      }
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onPressShare = (item) => {
    if (global.me) {
      Global.sharePost(item, global.me);
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onOpenProfileSheet = () => {
    this.profileSheet?.current?.open();
  };

  onCloseComments = () => {
    this.profileSheet?.current?.close();
  };

  checkSignin = () => {
    if (!global.me && global._prevScreen === 'profile_edit') {
      this.onRefresh();
    }
  };

  render() {
    return (
      <View style={GStyles.container}>
        {this.___renderStatusBar()}
        {this._renderVideo()}
        {this._renderProgress()}
        <RBSheet
          ref={this.profileSheet}
          openDuration={250}
          height={SHEET_HEIGHT}
          keyboardAvoidingViewEnabled={true}
          customStyles={{
            draggableIcon: {
              width: 0,
              height: 0,
              padding: 0,
              margin: 0,
            },
          }}
        >
          <CommentsScreen post={this.state.item} onCloseComments={this.onCloseComments} />
        </RBSheet>
      </View>
    );
  }

  _renderVideo = () => {
    const { isFetching, posts } = this.state;

    return (
      <FlatList
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        pagingEnabled
        onRefresh={() => {
          this.onRefresh('pull');
        }}
        refreshing={isFetching}
        ListFooterComponent={this._renderFooter}
        onEndReachedThreshold={0.4}
        onMomentumScrollBegin={() => {
          this.setState({ onEndReachedDuringMomentuam: false });
        }}
        onEndReached={() => {
          if (!this.state.onEndReachedDuringMomentum) {
            this.setState({ onEndReachedDuringMomentum: true });
            this.onRefresh('more');
          }
        }}
        data={posts}
        renderItem={this._renderItem}
        onViewableItemsChanged={this.onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 60,
        }}
        keyExtractor={(item, index) => index.toString()}
        style={{ height: '100%', width: '100%' }}
      />
    );
  };

  _renderFooter = () => {
    const { isFetching } = this.state;

    if (!isFetching) return null;
    return <ActivityIndicator style={{ color: '#000' }} />;
  };

  _renderItem = ({ item, index }) => {
    const actions = {
      onPressLike: this.onPressLike,
      onPressMessage: this.onPressMessage,
      onPressShare: this.onPressShare,
      onPressAvatar: this.onPressAvatar,
    };
    return (
      <RenderPosts
        item={item}
        state={this.state}
        index={index}
        actions={actions}
        onOpenProfileSheet={this.onOpenProfileSheet}
      />
    );
  };

  _renderProgress = () => {
    const { percent, isVisibleProgress } = this.state;

    return <ProgressModal percent={percent} isVisible={isVisibleProgress} />;
  };

  ___renderStatusBar = () => {
    return <StatusBar hidden />;
  };
}

export default connect(
  (state) => ({
    user: state.me?.user || {},
  }),
  { setMyUserAction },
)(PlayMainScreen);
