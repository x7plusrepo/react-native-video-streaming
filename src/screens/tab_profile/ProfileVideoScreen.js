import React, { Component } from 'react';
import {
  ActivityIndicator,
  AppState,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';

import { RNFFmpeg } from 'react-native-ffmpeg';

import ProgressModal from '../../components/ProgressModal';

import {
  Constants,
  Global,
  GStyles,
  Helper,
  RestAPI,
} from '../../utils/Global';
import RenderProducts from '../../components/products/RenderProduct';

const ic_back = require('../../assets/images/Icons/ic_back.png');

const VIDEO_HEIGHT = Dimensions.get('screen').height;

class ProfileVideoScreen extends Component {
  constructor(props) {
    super(props);

    console.log('ProfileVideoScreen start');

    this.init();
  }

  componentDidMount() {
    this.isMounted = true;

    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      let { itemDatas } = this.state;

      Helper.setDarkStatusBar();

      if (itemDatas.length < 1) {
        if (global._prevScreen === 'home_main_video') {
          itemDatas = global._exploreMainVideoDatas;
        } else if (global._prevScreen === 'profile_my_video') {
          itemDatas = global._profileMyVideoDatas;
        } else if (global._prevScreen === 'profile_liked_video') {
          itemDatas = global._profileLikedVideoDatas;
        } else if (global._prevScreen === 'profile_other') {
          itemDatas = global._profileOtherVideoDatas;
        } else if (global._prevScreen === 'stream_header') {
          itemDatas = global._randomProducts;
        } else {
          itemDatas = [];
        }

        this.setState({ itemDatas: itemDatas });
      }

      this.setState({ isVideoPause: false });
    });
    this.unsubscribeBlur = this.props.navigation.addListener('blur', () => {
      if (this.isMounted) {
        this.setState({ isVideoPause: true });
      }
    });

    AppState.addEventListener('change', this.onChangeAppState);
  }

  componentWillUnmount() {
    this.unsubscribeFocus();
    this.unsubscribeBlur();
    AppState.removeEventListener('change', this.onChangeAppState);
    this.isMounted = false;
  }

  onChangeAppState = (nextAppState) => {
    if (nextAppState === 'active') {
      if (this.props.navigation.isFocused()) {
        this.setState({ isVideoPause: false });
      }
    } else {
      this.setState({ isVideoPause: true });
    }
  };

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
      itemDatas: [],
      onEndReachedDuringMomentum: true,
      curIndex: -1,
      item: {},
    };
  };

  onRefresh = (type) => {
    let { isFetching, totalCount, curPage, itemDatas, keyword } = this.state;

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

    if (type === 'init') {
      //showForcePageLoader(true);
    } else {
      this.setState({ isFetching: true });
    }
    let params = {
      user_id: global.me?.id,
      page_number: type === 'more' ? curPage : '1',
      count_per_page: Constants.COUNT_PER_PAGE,
      keyword: keyword,
    };
    RestAPI.get_searched_video_list(params, (json, err) => {
      if (type === 'init') {
        showForcePageLoader(false);
      } else {
        if (this.isMounted) {
          this.setState({ isFetching: false });
        }
      }

      if (err !== null) {
        Helper.alertNetworkError(err?.message);
      } else {
        if (json.status === 200) {
          if (this.isMounted) {
            this.setState({ totalCount: json.data.totalCount });
            if (type === 'more') {
              let data = itemDatas.concat(json.data.videoList);
              this.setState({ itemDatas: data });
            } else {
              this.setState({ itemDatas: json.data.videoList });
            }
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onBack = () => {
    this.setState({ isVideoPause: true });
    this.props.navigation.goBack();
  };

  onViewableItemsChanged = ({ changed }) => {
    if (changed.length > 0) {
      const focused = changed[0];
      const item = focused?.item || {};
      this.setState({ curIndex: focused.index });

      if (this.state.item?.id === item?.id) {
        return;
      }

      this.setState({ item });
      global._opponentUser = item.user;

      let params = {
        video_id: item?.id,
        owner_id: item.user?.id,
        viewer_id: global.me ? global.me?.id : 0,
        device_type: Platform.OS === 'ios' ? '1' : '0',
        device_identifier: global._deviceId,
      };

      RestAPI.update_video_view(params, (json, err) => {});
    }
  };

  onPressAvatar = (item) => {
    const user = item?.user || {};

    if (global.me) {
      if (user.id === global.me?.id) {
        this.props.navigation.navigate('profile');
      } else {
        global._opponentUser = user;
        // this.props.navigation.navigate('profile_other');
        const pushAction = StackActions.push('profile_other', null);
        this.props.navigation.dispatch(pushAction);
      }
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onPressLike = (isChecked, item) => {
    let { itemDatas } = this.state;

    if (global.me) {
      item.likeCount++;
      const params = {
        user_id: global.me?.id,
        video_id: item.id,
        is_like: isChecked,
      };
      RestAPI.update_like_video(params, (json, err) => {
        showForcePageLoader(false);

        if (err !== null) {
          Helper.alertNetworkError(err?.message);
        } else {
          if (json.status === 200) {
            item.isLiked = isChecked;
            this.setState({ itemDatas });
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
      Global.shareProduct(item, global.me);
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onDownloadVideo = async () => {
    const item = this.state.item || {};
    const user = item?.userId || {};

    if (!global.me) {
      return;
    }

    Helper.hasPermissions();

    this.setState({ percent: 0, isVisibleProgress: true });

    RNFetchBlob.config({
      fileCache: true,
      appendExt: 'mp4',
    })
      .fetch('GET', item.url, {})
      .uploadProgress((written, total) => {
        console.log('uploaded', written / total);
      })
      .progress((received, total) => {
        const percent = Math.round((received * 100) / total);
        console.log('progress', percent);
        this.setState({ percent });
      })
      .then((resp) => {
        this.setState({ isVisibleProgress: false });
        success(Constants.SUCCESS_TITLE, 'Success to download');
        const originPath = resp.path();
        const newPath = originPath + '.mp4';
        const watermarkText =
          '@' +
          user.username +
          '\n#' +
          item.number +
          '\n' +
          item.price +
          '\n' +
          item.description;
        const fontPath =
          Platform.OS === 'android'
            ? '/system/fonts/Roboto-Bold.ttf'
            : RNFS.DocumentDirectoryPath + '/watermark.ttf';
        const watermark = RNFS.DocumentDirectoryPath + '/watermark.png';
        const parameter =
          '-y -i ' +
          originPath +
          ' -i ' +
          watermark +
          ' -filter_complex "[1]scale=iw*0.15:-1[wm];[0][wm]overlay=x=20:y=20,drawtext=text=\'' +
          watermarkText +
          "':x=10:y=70:fontfile=" +
          fontPath +
          ':fontsize=16:fontcolor=white" ' +
          newPath;

        showForcePageLoader(true);
        RNFFmpeg.execute(parameter).then((result) => {
          console.log(`FFmpeg process exited with rc=${result}.`);
          CameraRoll.save(newPath, 'video')
            .then((gallery) => {
              resp.flush();
              showForcePageLoader(false);
            })
            .catch((err) => {
              showForcePageLoader(false);
            });
        });
      })
      .catch((err) => {
        showForcePageLoader(false);
        error(Constants.ERROR_TITLE, 'Failed to download');
      });
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
        />
      </TouchableOpacity>
    );
  };
  _renderVideo = () => {
    const { isFetching, itemDatas } = this.state;

    return (
      <FlatList
        showsVerticalScrollIndicator={false}
        initialScrollIndex={
          itemDatas.length > global._selIndex ? global._selIndex : 0
        }
        getItemLayout={(data, index) => ({
          length: VIDEO_HEIGHT,
          offset: VIDEO_HEIGHT * index,
          index,
        })}
        pagingEnabled
        onRefresh={() => {
          this.onRefresh('pull');
        }}
        refreshing={isFetching}
        onEndReachedThreshold={0.4}
        onMomentumScrollBegin={() => {
          this.setState({ onEndReachedDuringMomentum: false });
        }}
        onEndReached={() => {
          if (!this.state.onEndReachedDuringMomentum) {
            this.setState({ onEndReachedDuringMomentum: true });
            this.onRefresh('more');
          }
        }}
        data={itemDatas}
        renderItem={this._renderItem}
        onViewableItemsChanged={this.onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 60,
        }}
        keyExtractor={(item, index) => index.toString()}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'black',
          zIndex: 1,
          elevation: 1,
        }}
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
      <RenderProducts
        item={item}
        state={this.state}
        index={index}
        actions={actions}
        detailStyle={{ bottom: 36 }}
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
  return (
    <ProfileVideoScreen {...props} navigation={navigation} route={route} />
  );
}
