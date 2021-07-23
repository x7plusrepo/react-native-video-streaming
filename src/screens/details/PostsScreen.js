import React, { Component } from 'react';
import {
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Platform,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';

import ProgressModal from '../../components/ProgressModal';
import RenderPosts from '../../components/posts/RenderPosts';

import { Global, GStyles, Helper, RestAPI } from '../../utils/Global';
import CommentsScreen from './CommentsScreen';
import RBSheet from 'react-native-raw-bottom-sheet';

const ic_back = require('../../assets/images/Icons/ic_back.png');

const VIDEO_HEIGHT = Dimensions.get('window').height;

class PostsScreen extends Component {
  constructor(props) {
    super(props);

    console.log('PostsScreen start');
    this.profileSheet = React.createRef();
    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
    this.init();
  }

  componentDidMount() {
    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      this.keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        this._keyboardDidShow,
      );
      this.keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        this._keyboardDidHide,
      );
    });
    this.unsubscribeBlur = this.props.navigation.addListener('blur', () => {
      global._prevScreen = 'play_main';
      this.keyboardDidShowListener && this.keyboardDidShowListener.remove();
      this.keyboardDidHideListener && this.keyboardDidHideListener.remove();
    });
  }

  componentWillUnmount() {
    this.unsubscribeFocus && this.unsubscribeFocus();
    this.unsubscribeBlur && this.unsubscribeBlur();
  }

  init = () => {
    this.state = {
      isVideoLoading: false,
      isVideoPause: false,

      isVisibleProgress: false,
      percent: 0,

      isFetching: false,
      isLiking: false,
      totalCount: global._totalCount,
      curPage: global._curPage ? global._curPage : '1',
      keyword: global._keyword ? global._keyword : '',
      posts: global._postsList || [],
      curIndex: -1,
      item: {},
    };
  };

  _keyboardDidShow() {
    this.setState({ isKeyboardShowing: true });
  }

  _keyboardDidHide() {
    this.setState({ isKeyboardShowing: false });
  }

  onBack = () => {
    this.props.navigation.goBack();
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
      if (!item.isViewed) {
        let params = {
          postId: item.id,
          viewerId: global.me ? global.me.id : 0,
          deviceType: Platform.OS === 'ios' ? '1' : '0',
          deviceIdentifier: global._deviceId,
        };
        RestAPI.update_post_view(params, (json, err) => {});
      }
    }
  };

  onPressAvatar = (item) => {
    const user = item?.user || {};
    if (global.me) {
      if (user.id === global.me?.id) {
        this.props.navigation.navigate('profile');
      } else {
        global._opponentUser = user;
        global._prevScreen = 'profile_video';
        this.props.navigation.navigate('profile_other');
      }
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onPressLike = (isChecked, item) => {
    if (this.state.isLiking) {
      return;
    }
    if (global.me) {
      const { posts } = this.state;
      item.likeCount = (item.likeCount || 0) + (isChecked ? 1 : -1);
      item.isLiked = isChecked;
      const params = {
        userId: global.me?.id,
        ownerId: item?.user?.id,
        postId: item.id,
        isLiked: isChecked,
      };
      this.setState({ isLiking: true });
      RestAPI.update_like_post(params, (json, err) => {
        global.showForcePageLoader(false);

        if (err !== null) {
          Helper.alertNetworkError(err?.message);
        } else {
          if (json.status === 200) {
            this.setState({ posts });
          } else {
            Helper.alertServerDataError();
          }
        }
        this.setState({ isLiking: false });
      });
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onPressMessage = (item) => {
    const user = item?.user || {};

    if (global.me) {
      if (user.id !== global.me?.id) {
        this.props.navigation.navigate('message_chat', { opponentUser: user });
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

  onAddComment = (postId, commentsCount) => {
    const { posts } = this.state;
    const newPosts = [...posts];
    const item = newPosts.find((p) => p.id === postId);
    if (item) {
      item.commentsCount = commentsCount;
    }
    this.setState({ posts: newPosts });
  };

  render() {
    const { isKeyboardShowing } = this.state;
    const sheetHeight = isKeyboardShowing ? 150 : VIDEO_HEIGHT * 0.75;

    return (
      <View style={GStyles.container}>
        {this.___renderStatusBar()}
        {this._renderVideo()}
        {this._renderProgress()}
        {this._renderBack()}
        <RBSheet
          ref={this.profileSheet}
          openDuration={250}
          keyboardAvoidingViewEnabled={true}
          customStyles={{
            draggableIcon: {
              width: 0,
              height: 0,
              padding: 0,
              margin: 0,
            },
            container: {
              height: sheetHeight,
            },
          }}
        >
          <CommentsScreen
            post={this.state.item}
            onCloseComments={this.onCloseComments}
            onAddComment={this.onAddComment}
            isKeyboardShowing={isKeyboardShowing}
          />
        </RBSheet>
      </View>
    );
  }

  _renderBack = () => {
    return (
      <TouchableOpacity
        style={GStyles.backButtonContainer}
        onPress={this.onBack}
      >
        <Image
          source={ic_back}
          style={{ width: 16, height: 16, tintColor: 'white' }}
          resizeMode={'contain'}
          tintColor={'white'}
        />
      </TouchableOpacity>
    );
  };
  _renderVideo = () => {
    const { isFetching, posts } = this.state;

    return (
      <FlatList
        showsVerticalScrollIndicator={false}
        initialScrollIndex={
          posts.length > global._selIndex ? global._selIndex : 0
        }
        getItemLayout={(data, index) => ({
          length: VIDEO_HEIGHT,
          offset: VIDEO_HEIGHT * index,
          index,
        })}
        pagingEnabled
        refreshing={isFetching}
        onEndReachedThreshold={0.4}
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
        state={{ ...this.state }}
        index={index}
        actions={actions}
        detailStyle={{ bottom: 36 + Helper.getBottomBarHeight() }}
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

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return <PostsScreen {...props} navigation={navigation} route={route} />;
}
