import React, { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  View,
} from 'react-native';

import SplashScreen from 'react-native-splash-screen';
import { connect } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';

import { RNFFmpeg } from 'react-native-ffmpeg';

import { setMyUserAction } from '../../redux/me/actions';
import { setProducts, updateProduct } from '../../redux/products/actions';

import ProgressModal from '../../components/ProgressModal';

import {
  Constants,
  Global,
  GStyles,
  Helper,
  RestAPI,
} from '../../utils/Global';
import ChatStreamSocketManager from './../../utils/Message/SocketManager';
import RenderProducts from '../../components/products/RenderProduct';

class PlayMainScreen extends Component {
  constructor(props) {
    super(props);

    console.log('PlayMainScreen start');

    SplashScreen.hide();
    this.init();
  }

  componentDidMount() {
    this.setState({ isMounted: true });

    this.onRefresh('init');

    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('play'));
      Helper.setDarkStatusBar();
      this.checkSignin();
      this.setState({ isVideoPause: false });
    });
    this.unsubscribeBlur = this.props.navigation.addListener('blur', () => {
      if (this.state.isMounted) {
        this.setState({ isVideoPause: true });
        global._prevScreen = 'play_main';
      }
    });
    BackHandler.addEventListener('hardwareBackPress', this.onBack);

    AppState.addEventListener('change', this.onChangeAppState);
  }

  componentWillUnmount() {
    this.unsubscribeFocus();
    this.unsubscribeBlur();
    BackHandler.removeEventListener('hardwareBackPress', this.onBack);
    AppState.removeEventListener('change', this.onChangeAppState);

    this.setState({ isMounted: false });
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

  init = async () => {
    this.state = {
      isVideoLoading: false,
      isVideoPause: false,

      isVisibleProgress: false,
      percent: 0,

      isFetching: false,
      totalCount: 0,
      curPage: 1,
      item: {},
      onEndReachedDuringMomentum: true,
      curIndex: null,
      isMounted: false,
    };

    await Helper.setDeviceId();
    Helper.hasPermissions();
  };

  onRefresh = async (type) => {
    let { isFetching, totalCount, curPage } = this.state;

    const { products } = this.props;

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

    RestAPI.get_all_video_list(params, async (json, err) => {
      if (type === 'init') {
        showForcePageLoader(false);
        setIsInitLoading(false);
      } else {
        if (this.state.isMounted) {
          this.setState({ isFetching: false });
        }
      }

      if (err !== null) {
        Helper.alertNetworkError(err?.message);
      } else {
        if (json.status === 200) {
          if (this.state.isMounted) {
            this.setState({ totalCount: json.data.totalCounts });
            if (type === 'more') {
              let data = products.concat(json.data.videoList || []);
              this.props.setProducts(data);
            } else {
              this.props.setProducts(json.data.videoList || []);
              if (json.data?.loginResult?.user) {
                ChatStreamSocketManager.instance.emitLeaveRoom({
                  roomId: global.me?.id,
                  userId: global.me?.id,
                });

                global.me = json.data?.loginResult?.user;

                ChatStreamSocketManager.instance.emitJoinRoom({
                  roomId: global.me?.id,
                  userId: global.me?.id,
                });

                this.props.setMyUserAction(global.me);
                Helper.setLocalValue(Constants.KEY_USERNAME, username);
                Helper.setLocalValue(Constants.KEY_PASSWORD, password);
                Helper.callFunc(global.onSetUnreadCount);
                Global.registerPushToken();
              }
            }
          }
        } else {
          Helper.alertServerDataError();
        }
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
        video_id: item.id,
        owner_id: item.user?.id,
        viewer_id: global.me ? global.me.id : 0,
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
        this.props.navigation.navigate('profile_other');
      }
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onPressLike = (isChecked, item) => {
    if (global.me) {
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
            this.props.updateProduct(item?.id, {
              ...item,
              likeCount: item.likeCount + 1,
              isLiked: isChecked,
            });
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
      Global.shareProduct(item, global.me);
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onDownloadVideo = async () => {
    const item = this.state.item || {};
    const user = item?.user || {};

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
      </View>
    );
  }

  _renderVideo = () => {
    const { isFetching } = this.state;
    const { products } = this.props;

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
        data={products}
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
      <RenderProducts
        item={item}
        state={this.state}
        index={index}
        actions={actions}
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
    products: state.products?.products || [],
  }),
  { setMyUserAction, setProducts, updateProduct },
)(PlayMainScreen);
