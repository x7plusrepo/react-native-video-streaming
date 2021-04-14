import React, { Component } from 'react';
import {
  AppState,
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Image,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';

import convertToProxyURL from 'react-native-video-cache';
import Share, { ShareSheet } from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';
import RBSheet from 'react-native-raw-bottom-sheet';
import { ShareDialog, MessageDialog } from 'react-native-fbsdk';

import { RNFFmpeg } from 'react-native-ffmpeg';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';

import Video from 'react-native-video';
import Avatar from '../../components/elements/Avatar';
import ProgressModal from '../../components/ProgressModal';

import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
  RestAPI,
} from '../../utils/Global/index';

const img_default_avatar = require('../../assets/images/ic_default_avatar.png');
const ic_favorite = require('../../assets/images/ic_favorite.png');
const ic_message = require('../../assets/images/ic_message.png');

const WINDOW_HEIGHT = Helper.getWindowHeight();
const STATUS_BAR_HEIGHT = Helper.getStatusBarHeight();
const BOTTOM_BAR_HEIGHT = Helper.getBottomBarHeight();
const VIDEO_HEIGHT = WINDOW_HEIGHT - STATUS_BAR_HEIGHT - BOTTOM_BAR_HEIGHT;

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
      // this.onRefresh('init');
      this.checkSignin();
      this.setState({ isVideoPause: false });

      if (this.props.navigation.canGoBack()) {
        BackHandler.removeEventListener('hardwareBackPress', this.onBack);
      } else {
        BackHandler.removeEventListener('hardwareBackPress', this.onBack);
        this.backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          this.onBack,
        );
      }
    });
    this.unsubscribeBlur = this.props.navigation.addListener('blur', () => {
      if (this.state.isMounted) {
        this.setState({ isVideoPause: true });
      }
    });

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
      isVideoLoading: true,
      isVideoPause: false,

      isVisibleProgress: false,
      percent: 0,

      isFetching: false,
      totalCount: 0,
      curPage: 1,
      itemDatas: [],
      item: {},
      onEndReachedCalledDuringMomentum: true,
      curIndex: null,
      isMounted: false,
      username: null,
      password: null,
    };

    await Helper.setDeviceId();
    Helper.hasPermissions();

    console.log('--- crn_dev --- global._devId:', global._devId);
  };

  onRefresh = async (type) => {
    let { isFetching, totalCount, curPage, itemDatas } = this.state;

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
    this.setState({ curPage, onEndReachedCalledDuringMomentum: true });

    if (type === 'init') {
      showForcePageLoader(true);

      const username = await Helper.getLocalValue(Constants.KEY_USERNAME);
      const password = await Helper.getLocalValue(Constants.KEY_PASSWORD);
      this.setState({ username, password });
    } else {
      this.setState({ isFetching: true });
    }
    let params = {
      user_id: global.me ? global.me.id : '',
      page_number: type === 'more' ? curPage : '1',
      count_per_page: Constants.COUNT_PER_PAGE,
      username: this.state.username
        ? this.state.username
        : 'guest_' + global._devId,
      password: this.state.password ? this.state.password : '',
    };
    RestAPI.get_all_video_list(params, (json, err) => {
      if (type === 'init') {
        showPageLoader(false);
      } else {
        if (this.state.isMounted) {
          this.setState({ isFetching: false });
        }
      }

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 200) {
          if (this.state.isMounted) {
            this.setState({ totalCount: json.data.totalCounts });
            if (type === 'more') {
              let data = itemDatas.concat(json.data.videoList);
              this.setState({ itemDatas: data });
            } else {
              this.setState({ itemDatas: json.data.videoList });
              if (!global.me) {
                global.me = json.data.loginResult.user;

                if (global.me.username.indexOf('guest_') > -1) {
                  global.me.isGuest = true;
                } else {
                  global.me.isGuest = false;
                }

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
    }

    return true;
  };

  onVideoReadyForDisplay = (item) => {
    console.log('---onVideoReadyForDisplay');
    this.setState({ isVideoLoading: false });
  };

  onVideoBuffer = () => {};

  onVideoError = () => {
    console.log('---onVideoError');
  };

  onVideoLoad = () => {
    //this.setState({ isVideoLoading: false });
    console.log('---onVideoLoad');
  };

  onVideoProgress = (value) => {};

  onVideoEnd = () => {};

  onViewableItemsChanged = ({ changed }) => {
    if (changed.length > 0) {
      const focused = changed[0];
      const item = focused?.item || {};
      this.setState({ curIndex: focused.index });

      if (this.state.item?.id === item.id) {
        return;
      }

      this.setState({ item });

      let params = {
        video_id: item.id,
        owner_id: item.userId?.id,
        viewer_id: global.me ? global.me.id : 0,
        device_type: Platform.OS === 'ios' ? '1' : '0',
        device_identifier: global._deviceId,
      };
      RestAPI.update_video_view(params, (json, err) => {});
    }
  };

  onPressAvatar = (item) => {
    const user = item?.userId || {};
    if (global.me) {
      if (user.id === global.me.id) {
        this.props.navigation.navigate('profile');
      } else {
        global._opponentId = user.id;
        global._opponentName = user.username;
        global._opponentPhoto = user.photo;
        this.props.navigation.navigate('profile_other');
      }
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onPressLike = (isChecked, item) => {
    let { itemDatas } = this.state;

    if (global.me) {
      if (isChecked) {
        item.likeCount++;
      } else {
        item.likeCount--;
      }

      const params = {
        user_id: global.me.id,
        video_id: item.id,
        is_like: isChecked,
      };
      showPageLoader(true);
      RestAPI.update_like_video(params, (json, err) => {
        showPageLoader(false);

        if (err !== null) {
          Helper.alertNetworkError(err?.message);
        } else {
          if (json.status === 200) {
            item.isLike = isChecked;
            this.setState(itemDatas);
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
    const user = item?.userId || {};

    if (global.me) {
      if (user.id === global.me.id) {
        return;
      } else {
        global._roomId = user.id;
        global._opponentName = user.username;
        this.props.navigation.navigate('message_chat');
      }
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onPressShare = (item) => {
    if (global.me) {
      this.setState({ item })
      this.Scrollable.open();
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onShareFacebook = async () => {
    this.Scrollable.close();
    const user = this.state.item?.userId || {};

    if (Platform.OS === 'android') {
      const SHARE_LINK_CONTENT = {
        contentType: 'link',
        contentUrl: Constants.GOOGLE_PLAY_URL,
        quote: '@' + user.username + ' #' + this.state.item?.number,
      };

      const canShow = await ShareDialog.canShow(SHARE_LINK_CONTENT);
      if (canShow) {
        try {
          const { isCancelled, postId } = await ShareDialog.show(
            SHARE_LINK_CONTENT,
          );
          if (isCancelled) {
            warning(Constants.WARNING_TITLE, 'Share cancelled');
          } else {
            success(Constants.SUCCESS_TITLE, 'Success to share');
          }
        } catch (error) {
          error(Constants.ERROR_TITLE, 'Failed to share');
        }
      }
    } else {
      const shareOptions = {
        title: 'Share to Facebook',
        message: '@' + user.username + ' #' + this.state.item.number,
        url: Constants.GOOGLE_PLAY_URL,
        social: Share.Social.FACEBOOK,
      };
      Share.shareSingle(shareOptions)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          err && console.log(err);
        });
    }
  };

  onShareFacebookMessenger = async () => {
    this.Scrollable.close();
    const user = this.state.item?.userId || {};

    const SHARE_LINK_CONTENT = {
      contentType: 'link',
      contentUrl: Constants.GOOGLE_PLAY_URL,
      quote: '@' + user.username + ' #' + this.state.item?.number,
    };

    const canShow = await MessageDialog.canShow(SHARE_LINK_CONTENT);
    if (canShow) {
      try {
        const { isCancelled, postId } = await MessageDialog.show(
          SHARE_LINK_CONTENT,
        );
        if (isCancelled) {
          warning(Constants.WARNING_TITLE, 'Share cancelled');
        } else {
          success(Constants.SUCCESS_TITLE, 'Success to share');
        }
      } catch (error) {
        error(Constants.ERROR_TITLE, 'Failed to share');
      }
    }
  };

  onShareWhatsApp = async () => {
    this.Scrollable.close();

    if (Platform.OS === 'android') {
      const shareOptions = {
        title: 'Share to WhatsApp',
        // message: '@' + this.state.item?.username + ' #' + this.state.item?.number,
        url: Constants.GOOGLE_PLAY_URL,
        social: Share.Social.WHATSAPP,
      };
      Share.shareSingle(shareOptions)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          err && console.log(err);
        });
    } else {
      let url = 'whatsapp://send?text=' + Constants.GOOGLE_PLAY_URL;
      Linking.openURL(url)
        .then((data) => {
          console.log('WhatsApp Opened');
        })
        .catch(() => {
          alert('Make sure Whatsapp installed on your device');
        });
    }
  };

  onDownloadVideo = async () => {
    this.Scrollable.close();
    const item = this.state.item || {}
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
              showPageLoader(false);
            })
            .catch((err) => {
              showPageLoader(false);
            });
        });
      })
      .catch((err) => {
        showPageLoader(false);
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
      <>
        {this._renderVideo()}
        {this._renderShare()}
        {this._renderProgress()}
      </>
    );
  }

  _renderVideo = () => {
    const { isFetching, itemDatas } = this.state;
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
          this.setState({ onEndReachedCalledDuringMomentum: false });
        }}
        onEndReached={() => {
          if (!this.state.onEndReachedCalledDuringMomentum) {
            this.setState({ onEndReachedCalledDuringMomentum: true });
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
          height: VIDEO_HEIGHT,
          position: 'absolute',
          left: 0,
          top: 0,
          backgroundColor: 'black',
          zIndex: 1,
          elevation: 1,
        }}
      />
    );
  };

  _renderFooter = () => {
    const { isFetching } = this.state;

    if (!isFetching) return null;
    return <ActivityIndicator style={{ color: '#000' }} />;
  };

  _renderItem = ({ item, index }) => {
    const { isVideoLoading, isVideoPause } = this.state;
    const paused = isVideoPause || this.state.curIndex !== index;
    const user = item.userId || {};
    if (Math.abs(this.state.curIndex - index) > 2) {
      return (
        <View
          style={{
            width: '100%',
            height: VIDEO_HEIGHT,
            borderWidth: 1,
            borderColor: 'black',
          }}
        />
      );
    } else {
      const isLike = !!item.isLike;
      const newTagList = item.tagList?.map((tag) => tag.name)?.join(' ');

      if (this.state.curIndex === index) {
        global._opponentId = user?.id;
        global._opponentName = user.username;
        global._opponentPhoto = user.photo;
      }

      return (
        <View
          style={{
            width: '100%',
            height: VIDEO_HEIGHT,
            borderWidth: 1,
            borderColor: 'black',
          }}
        >
          <Video
            source={{ uri: convertToProxyURL(item.url) }}
            ref={(ref) => {
              this.player = ref;
            }}
            //resizeMode="contain"
            repeat
            paused={paused}
            playWhenInactive={false}
            playInBackground={false}
            poster={item.thumb}
            //posterResizeMode="contain"
            onReadyForDisplay={() => {
              this.onVideoReadyForDisplay(item);
            }}
            onBuffer={this.onVideoBuffer}
            onError={this.onVideoError}
            onLoad={this.onVideoLoad}
            onProgress={this.onVideoProgress}
            onEnd={this.onVideoEnd}
            bufferConfig={{
              minBufferMs: 15000,
              maxBufferMs: 30000,
              bufferForPlaybackMs: 5000,
              bufferForPlaybackAfterRebufferMs: 5000,
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              backgroundColor: 'black',
            }}
          />
          {isVideoLoading === 'loading' && ( // TODO - review later
            <View
              style={{
                marginTop: 16,
                height: '100%',
                alignSelf: 'center',
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" color="lightgray" />
            </View>
          )}
          <View
            style={{
              position: 'absolute',
              bottom: 50,
              right: 12,
              alignItems: 'flex-end',
              zIndex: 100,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => {
                  this.onPressLike(!isLike, item);
                }}
              >
                <Image
                  source={ic_favorite}
                  style={{
                    ...GStyles.image,
                    width: 32,
                    tintColor: isLike ? GStyle.redColor : GStyle.activeColor,
                  }}
                />
              </TouchableOpacity>
              <Text
                style={{
                  ...GStyles.regularText,
                  color: 'white',
                  // backgroundColor: 'white',
                  marginTop: 2,
                  paddingTop: 2,
                  paddingBottom: 1,
                  paddingHorizontal: 2,
                }}
              >
                {item.likeCount}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.onPressMessage(item);
                }}
                style={{ marginTop: 18 }}
              >
                <Image
                  source={ic_message}
                  style={{
                    ...GStyles.image,
                    width: 32,
                    tintColor: GStyle.activeColor,
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.onPressShare(item);
                }}
                style={{ marginTop: 32 }}
              >
                <FontAwesome
                  name="share"
                  style={{ fontSize: 30, color: GStyle.activeColor }}
                />
              </TouchableOpacity>
              <View
                style={{
                  alignItems: 'center',
                  marginTop: 128,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    ...GStyles.regularText,
                    color: 'black',
                    backgroundColor: 'white',
                    marginTop: 2,
                    paddingTop: 2,
                    paddingBottom: 1,
                    paddingHorizontal: 2,
                  }}
                >
                  {item.left_days} days left
                </Text>
                <Text
                  style={{
                    ...GStyles.regularText,
                    color: 'black',
                    backgroundColor: 'white',
                    marginTop: 4,
                    paddingVertical: 2,
                    paddingHorizontal: 4,
                  }}
                >
                  #{item.number}
                </Text>
                <Avatar
                  image={{
                    uri: user.photo ? user.photo : img_default_avatar,
                  }}
                  size={48}
                  // borderRadius={29}
                  // borderWidth={1}
                  onPress={() => {
                    this.onPressAvatar(item);
                  }}
                  containerStyle={{ marginTop: 4 }}
                />
                <Text
                  style={{
                    ...GStyles.regularText,
                    maxWidth: 80,
                    color: 'white',
                  }}
                >
                  {user.username}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: 62,
              left: 12,
              justifyContent: 'flex-end',
            }}
          >
            <View
              style={{
                alignItems: 'flex-start',
                marginTop: 128,
                marginBottom: 12,
              }}
            >
              <View
                style={{ ...GStyles.rowContainer, justifyContent: 'center' }}
              >
                <Text
                  style={{
                    ...GStyles.mediumText,
                    color: 'black',
                    backgroundColor: 'white',
                    padding: 2,
                    paddingBottom: 1,
                  }}
                >
                  ৳{item.price}
                </Text>
                <Text
                  style={{
                    ...GStyles.regularText,
                    color: 'black',
                    backgroundColor: item.sticker > 0 ? 'white' : 'transparent',
                    marginLeft: 8,
                    paddingVertical: 2,
                    paddingHorizontal: 4,
                  }}
                >
                  {Constants.STICKER_NAME_LIST[Number(item.sticker)]}
                </Text>
                <View style={{ flex: 1 }} />
              </View>
              <Text
                numberOfLines={3}
                style={{
                  ...GStyles.mediumText,
                  lineHeight: 18,
                  color: 'black',
                  backgroundColor:
                    newTagList.length > 0 ? 'white' : 'transparent',
                  marginTop: 8,
                  padding: 2,
                  paddingBottom: 1,
                }}
              >
                {newTagList}
              </Text>
              <Text
                numberOfLines={5}
                style={{
                  ...GStyles.mediumText,
                  maxWidth: '80%',
                  lineHeight: 18,
                  color: 'black',
                  backgroundColor:
                    item.description.length > 0 ? 'white' : 'transparent',
                  marginTop: 8,
                  paddingTop: 2,
                  paddingBottom: 1,
                  paddingHorizontal: 2,
                }}
              >
                {item.description}
              </Text>
            </View>
          </View>
        </View>
      );
    }
  };

  _renderShare = () => {
    return (
      <View style={{ ...GStyles.centerAlign, ...GStyles.absoluteContainer }}>
        <RBSheet
          ref={(ref) => {
            this.Scrollable = ref;
          }}
          height={180}
          closeOnDragDown
          openDuration={250}
          customStyles={{
            container: {
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            },
          }}
        >
          {this._renderShareTitle()}
          <View
            style={{ ...GStyles.rowContainer, justifyContent: 'space-around' }}
          >
            {this._renderShareFacebook()}
            {this._renderShareFacebookMessenger()}
            {this._renderShareWhatsApp()}
            {this._renderShareDownload()}
          </View>
        </RBSheet>
      </View>
    );
  };

  _renderShareTitle = () => {
    return (
      <View style={{ ...GStyles.centerAlign }}>
        <Text style={{ ...GStyles.regularText }}>Share to</Text>
      </View>
    );
  };

  _renderShareFacebook = () => {
    return (
      <TouchableOpacity
        onPress={this.onShareFacebook}
        style={{
          marginTop: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#3b5998',
          }}
        >
          <FontAwesome
            name="facebook"
            style={{ fontSize: 30, color: 'white' }}
          />
        </View>
        <Text style={{ fontSize: 14, paddingTop: 10, color: '#333' }}>
          Facebook
        </Text>
      </TouchableOpacity>
    );
  };

  _renderShareFacebookMessenger = () => {
    return (
      <TouchableOpacity
        onPress={this.onShareFacebookMessenger}
        style={{
          marginTop: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#006fff',
          }}
        >
          <Fontisto name="messenger" style={{ fontSize: 30, color: 'white' }} />
        </View>
        <Text style={{ fontSize: 14, paddingTop: 10, color: '#333' }}>
          Messenger
        </Text>
      </TouchableOpacity>
    );
  };

  _renderShareWhatsApp = () => {
    return (
      <TouchableOpacity
        onPress={this.onShareWhatsApp}
        style={{
          marginTop: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#25D366',
          }}
        >
          <FontAwesome
            name="whatsapp"
            style={{ fontSize: 30, color: 'white' }}
          />
        </View>
        <Text style={{ fontSize: 14, paddingTop: 10, color: '#333' }}>
          WhatsApp
        </Text>
      </TouchableOpacity>
    );
  };

  _renderShareDownload = () => {
    return (
      <TouchableOpacity
        onPress={this.onDownloadVideo}
        style={{
          marginTop: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: GStyle.grayBackColor,
          }}
        >
          <FontAwesome
            name="download"
            style={{ fontSize: 30, color: '#333' }}
          />
        </View>
        <Text style={{ fontSize: 14, paddingTop: 10, color: '#333' }}>
          Save video
        </Text>
      </TouchableOpacity>
    );
  };

  _renderProgress = () => {
    const { percent, isVisibleProgress } = this.state;

    return <ProgressModal percent={percent} isVisible={isVisibleProgress} />;
  };

  ___renderStatusBar = () => {
    return <StatusBar backgroundColor="red" barStyle="light-content" />;
  };
}

const styles = StyleSheet.create({});

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return <PlayMainScreen {...props} navigation={navigation} route={route} />;
}
