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

import SplashScreen from 'react-native-splash-screen';
import { connect } from 'react-redux';
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
import { setMyUserAction } from '../../redux/me/actions';

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

import avatars from '../../assets/avatars';
const randomNumber = Math.floor(Math.random() * avatars.length);
const randomImageUrl = avatars[randomNumber];

const ic_eye = require('../../assets/images/Icons/ic_eye.png');
const ic_menu_saved_products = require('../../assets/images/Icons/ic_menu_saved_products.png');
const ic_menu_messages = require('../../assets/images/Icons/ic_menu_messages.png');
const ic_share = require('../../assets/images/Icons/ic_share.png');

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
                global.me = json.data.loginResult.user || {};

                if (global.me.username.indexOf('guest_') > -1) {
                  global.me.isGuest = true;
                } else {
                  global.me.isGuest = false;
                }

                this.props.setMyUserAction(global.me);

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
      this.setState({ item });
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
    const { isVideoPause } = this.state;
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
          <View style={GStyles.playInfoWrapper}>
            <View>
              <View style={[GStyles.rowEndContainer, { marginBottom: 8 }]}>
                <View style={GStyles.rowContainer}>
                  <View style={GStyles.playInfoTextWrapper}>
                    <Text style={GStyles.playInfoText}>৳{item.price}</Text>
                  </View>
                  {!!item.sticker && (
                    <View
                      style={[GStyles.playInfoTextWrapper, { marginLeft: 4 }]}
                    >
                      <Text style={GStyles.playInfoText}>
                        {Constants.STICKER_NAME_LIST[Number(item.sticker)]}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={GStyles.playInfoTextWrapper}>
                  <Text style={GStyles.playInfoText}>lorem ipsum</Text>
                </View>
              </View>
              <View style={[GStyles.rowEndContainer, { marginBottom: 8 }]}>
                <View style={GStyles.playInfoTextWrapper}>
                  <Text numberOfLines={3} style={GStyles.playInfoText}>
                    {newTagList}
                  </Text>
                </View>

                <View style={GStyles.playInfoTextWrapper}>
                  <Text style={GStyles.playInfoText}>#{item.number}</Text>
                </View>
              </View>
              <View style={[GStyles.rowEndContainer, { marginBottom: 8 }]}>
                {!!item?.description ? (
                  <View style={GStyles.playInfoTextWrapper}>
                    <Text numberOfLines={5} style={GStyles.playInfoText}>
                      {item.description}
                    </Text>
                  </View>
                ) : (
                  <View />
                )}

                <View style={GStyles.centerAlign}>
                  <Avatar
                    image={{
                      uri: user.photo ? user.photo : randomImageUrl,
                    }}
                    size={48}
                    onPress={() => {
                      this.onPressAvatar(item);
                    }}
                    containerStyle={{ marginBottom: 4 }}
                  />
                  <Text style={GStyles.textSmall}>{user.username}</Text>
                </View>
              </View>
            </View>

            <View style={GStyles.rowEndContainer}>
              <View style={GStyles.videoActionButton}>
                <Image
                  source={ic_eye}
                  style={{
                    ...GStyles.videoActionIcon,
                    tintColor: isLike ? GStyle.redColor : 'white',
                  }}
                />
                <Text style={GStyles.textSmall}>{100}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.onPressLike(!isLike, item);
                }}
                style={GStyles.videoActionButton}
              >
                <Image
                  source={ic_menu_saved_products}
                  style={{
                    ...GStyles.videoActionIcon,
                    tintColor: isLike ? GStyle.redColor : 'white',
                  }}
                />
                <Text style={GStyles.textSmall}>{item.likeCount}k</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  this.onPressMessage(item);
                }}
                style={GStyles.videoActionButton}
              >
                <Image
                  source={ic_menu_messages}
                  style={GStyles.videoActionIcon}
                />
                <Text style={GStyles.textSmall}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.onPressShare(item);
                }}
                style={GStyles.videoActionButton}
              >
                <Image source={ic_share} style={GStyles.videoActionIcon} />
                <Text style={GStyles.textSmall}>Share</Text>
              </TouchableOpacity>
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
          //height={180}
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

export default connect(
  (state) => ({
    user: state.me.user,
  }),
  { setMyUserAction },
)(PlayMainScreen);
