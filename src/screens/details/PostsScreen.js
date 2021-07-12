import React, { Component } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';

import ProgressModal from '../../components/ProgressModal';
import RenderPosts from '../../components/posts/RenderPosts';

import { Global, GStyles, Helper, RestAPI } from '../../utils/Global';

const ic_back = require('../../assets/images/Icons/ic_back.png');

const VIDEO_HEIGHT = Dimensions.get('window').height;

class PostsScreen extends Component {
  constructor(props) {
    super(props);

    console.log('PostsScreen start');

    this.init();
  }

  componentDidMount() {
    let posts;
    posts = global._postsList || [];
    this.setState({ posts });
    Helper.setDarkStatusBar();
  }

  init = () => {
    this.state = {
      isVideoLoading: false,
      isVideoPause: false,

      isVisibleProgress: false,
      percent: 0,

      isFetching: false,
      totalCount: global._totalCount,
      curPage: global._curPage ? global._curPage : '1',
      keyword: global._keyword ? global._keyword : '',
      posts: [],
      curIndex: -1,
      item: {},
    };
  };

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
    if (global.me) {
      const { posts } = this.state;
      item.likeCount++;
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

  render() {
    return (
      <View style={GStyles.container}>
        {this.___renderStatusBar()}
        {this._renderVideo()}
        {this._renderProgress()}
        {this._renderBack()}
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
