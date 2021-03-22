import React, {Component} from 'react';
import {
  AppState,
  ActivityIndicator,
  Alert,
  Animated,
  BallIndicator,
  BackHandler,
  Button,
  Clipboard,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  LayoutAnimation,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {useNavigation, useRoute, StackActions} from '@react-navigation/native';
import convertToProxyURL from 'react-native-video-cache';
import Share, {ShareSheet} from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';
import RBSheet from 'react-native-raw-bottom-sheet';
import {ShareDialog, MessageDialog} from 'react-native-fbsdk';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';

import {LogLevel, RNFFmpeg} from 'react-native-ffmpeg';

import {SearchBar} from 'react-native-elements';
import Swiper from '../../lib/Swiper/index';
import Video from 'react-native-video';
import Avatar from '../../components/elements/Avatar';
import GHeaderBar from '../../components/GHeaderBar';
import ProgressModal from '../../components/ProgressModal';
import CheckBox from '../../lib/Checkbox/index';

import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
  RestAPI,
} from '../../utils/Global/index';
import {Dropdown} from '../../lib/MaterialDropdown/index';
import {TextField} from '../../lib/MaterialTextField/index';
import Accordion from '../../lib/Collapsible/Accordion';
import {forEach} from 'underscore';

const img_default_avatar = require('../../assets/images/ic_default_avatar.png');
const ic_favorite = require('../../assets/images/ic_favorite.png');
const ic_message = require('../../assets/images/ic_message.png');
const ic_logo = require('../../assets/images/ic_logo.png');
const ic_back = require('../../assets/images/ic_back.png');

const WINDOW_HEIGHT = Helper.getWindowHeight();
const STATUS_BAR_HEIGHT = Helper.getStatusBarHeight();
const BOTTOM_BAR_HEIGHT = Helper.getBottomBarHeight();
const VIDEO_HEIGHT = WINDOW_HEIGHT - STATUS_BAR_HEIGHT - BOTTOM_BAR_HEIGHT;

class ProfileVideoScreen extends Component {
  constructor(props) {
    super(props);

    console.log('ProfileVideoScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;

    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      let {itemDatas} = this.state;

      Helper.setDarkStatusBar();

      if (itemDatas.length < 1) {
        if (global._prevScreen == 'home_main_video') {
          itemDatas = global._exploreMainVideoDatas;
        } else if (global._prevScreen == 'profile_my_video') {
          itemDatas = global._profileMyVideoDatas;
        } else if (global._prevScreen == 'profile_liked_video') {
          itemDatas = global._profileLikedVideoDatas;
        } else if (global._prevScreen == 'profile_other') {
          itemDatas = global._profileOtherVideoDatas;
        } else {
          itemDatas = [];
        }

        this.setState({itemDatas: itemDatas});
      }

      this.setState({isVideoPause: false});
    });
    this.unsubscribeBlur = this.props.navigation.addListener('blur', () => {
      if (this._isMounted) {
        this.setState({isVideoPause: true});
      }
    });

    AppState.addEventListener('change', this.onChangeAppState);
  }

  componentWillUnmount() {
    this.unsubscribeFocus();
    this.unsubscribeBlur();
    AppState.removeEventListener('change', this.onChangeAppState);

    this._isMounted = false;
  }

  onChangeAppState = (nextAppState) => {
    if (nextAppState === 'active') {
      if (this.props.navigation.isFocused()) {
        this.setState({isVideoPause: false});
      }
    } else {
      this.setState({isVideoPause: true});
    }
  };

  init = () => {
    this.state = {
      isVideoLoading: true,
      isVideoPause: false,

      isVisibleProgress: false,
      percent: 0,

      isFetching: false,
      totalCount: global._totalCount,
      curPage: global._curPage ? global._curPage : '1',
      keyword: global._keyword ? global._keyword : '',
      itemDatas: [],
    };

    this._curVideoId = -1;
    this._isMounted = false;
    this._curIndex = -1;
  };

  onRefresh = (type) => {
    let {isFetching, totalCount, curPage, itemDatas, keyword} = this.state;

    if (isFetching) {
      return;
    }

    if (type == 'more') {
      curPage += 1;
      const maxPage =
        (totalCount + Constants.COUNT_PER_PAGE - 1) / Constants.COUNT_PER_PAGE;
      if (curPage > maxPage) {
        return;
      }
    } else {
      curPage = 1;
    }
    this.setState({curPage});

    if (type == 'init') {
      showPageLoader(true);
    } else {
      this.setState({isFetching: true});
    }
    let params = {
      user_id: global.me ? global.me.id : '0',
      page_number: type == 'more' ? curPage : '1',
      count_per_page: Constants.COUNT_PER_PAGE,
      keyword: keyword,
    };
    RestAPI.get_filtered_video_list(params, (json, err) => {
      if (type == 'init') {
        showPageLoader(false);
      } else {
        if (this._isMounted) {
          this.setState({isFetching: false});
        }
      }

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 1) {
          if (this._isMounted) {
            this.setState({totalCount: json.data.total_count});
            if (type == 'more') {
              let data = itemDatas.concat(json.data.video_list);
              this.setState({itemDatas: data});
            } else {
              this.setState({itemDatas: json.data.video_list});
            }
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onBack = () => {
    this.setState({isVideoPause: true});
    this.props.navigation.goBack();
  };

  onVideoReadyForDisplay = (item) => {
    console.log('---onVideoReadyForDisplay');
    this.setState({isVideoLoading: false});

    if (this._curVideoId == item.id) {
      return;
    }
    this._curVideoId = item.id;

    let params = {
      video_id: item.id,
      owner_id: item.user_id,
      viewer_id: global.me ? global.me.id : 0,
      device_type: Platform.OS === 'ios' ? '1' : '0',
      device_identifier: global._deviceId,
    };

    RestAPI.update_video_view(params, (json, err) => {});
  };

  onVideoBuffer = () => {};

  onVideoError = () => {
    console.log('---onVideoError');
  };

  onVideoLoad = () => {
    console.log('---onVideoLoad');
  };

  onVideoProgress = (value) => {
    this.setState({isVideoLoading: false});
  };

  onVideoEnd = () => {};

  onViewableItemsChanged = ({viewableItems, changed}) => {
    if (changed.length > 0) {
      const item = changed[0];
      this._curIndex = item.index;
      this.setState({isVideoLoading: true});
    }
  };

  onPressAvatar = (item) => {
    if (global.me) {
      if (item.user_id == global.me.id) {
        this.props.navigation.navigate('profile');
      } else {
        global._opponentId = item.user_id;
        global._opponentName = item.user_name;
        global._opponentPhoto = item.user_photo;
        // this.props.navigation.navigate('profile_other');
        const pushAction = StackActions.push('profile_other', null);
        this.props.navigation.dispatch(pushAction);
      }
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onPressLike = (isChecked, item) => {
    let {itemDatas} = this.state;

    if (global.me) {
      if (isChecked) {
        item.like_count++;
      } else {
        item.like_count--;
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
          Helper.alertNetworkError();
        } else {
          if (json.status === 1) {
            item.is_like = isChecked;
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
    if (global.me) {
      if (item.user_id == global.me.id) {
        return;
      } else {
        global._roomId = item.user_id;
        global._opponentName = item.user_name;
        this.props.navigation.navigate('message_chat');
      }
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onPressShare = (item) => {
    if (global.me) {
      this._item = item;
      this.Scrollable.open();
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onShareFacebook = async () => {
    this.Scrollable.close();

    if (Platform.OS === 'android') {
      const SHARE_LINK_CONTENT = {
        contentType: 'link',
        contentUrl: Constants.GOOGLE_PLAY_URL,
        quote: '@' + this._item.user_name + ' #' + this._item.number,
      };

      const canShow = await ShareDialog.canShow(SHARE_LINK_CONTENT);
      if (canShow) {
        try {
          const {isCancelled, postId} = await ShareDialog.show(
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
        message: '@' + this._item.user_name + ' #' + this._item.number,
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

    const SHARE_LINK_CONTENT = {
      contentType: 'link',
      contentUrl: Constants.GOOGLE_PLAY_URL,
      quote: '@' + this._item.user_name + ' #' + this._item.number,
    };

    const canShow = await MessageDialog.canShow(SHARE_LINK_CONTENT);
    if (canShow) {
      try {
        const {isCancelled, postId} = await MessageDialog.show(
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
        // message: '@' + this._item.user_name + ' #' + this._item.number,
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

    if (!global.me) {
      return;
    }

    Helper.hasPermissions();

    this.setState({percent: 0, isVisibleProgress: true});

    RNFetchBlob.config({
      fileCache: true,
      appendExt: 'mp4',
    })
      .fetch('GET', this._item.url, {})
      .uploadProgress((written, total) => {
        console.log('uploaded', written / total);
      })
      .progress((received, total) => {
        const percent = Math.round((received * 100) / total);
        console.log('progress', percent);
        this.setState({percent});
      })
      .then((resp) => {
        this.setState({isVisibleProgress: false});
        success(Constants.SUCCESS_TITLE, 'Success to download');
        const originPath = resp.path();
        const newPath = originPath + '.mp4';
        const watermarkText =
          '@' +
          this._item.user_name +
          '\n#' +
          this._item.number +
          '\n' +
          this._item.price +
          '\n' +
          this._item.description;
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

  render() {
    return (
      <SafeAreaView>
        {this._renderVideo()}
        {this._renderShare()}
        {this._renderProgress()}
      </SafeAreaView>
    );
  }

  _renderVideo = () => {
    const {isFetching, itemDatas} = this.state;

    return (
      <>
        <FlatList
          showsVerticalScrollIndicator={false}
          initialNumToRender={itemDatas.length}
          initialScrollIndex={global._selIndex}
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
          ListFooterComponent={this._renderFooter}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            this.onRefresh('more');
          }}
          data={itemDatas}
          renderItem={this._renderItem}
          onViewableItemsChanged={this.onViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 60,
          }}
          keyExtractor={(item) => item.id.toString()}
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
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 20,
            zIndex: 1,
            elevation: 1,
          }}>
          <TouchableOpacity
            onPress={this.onBack}
            style={{...GStyles.centerAlign, width: 50, height: 50}}>
            <Image
              source={ic_back}
              style={{width: 20, height: 14, tintColor: 'white'}}></Image>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  _renderFooter = () => {
    const {isFetching} = this.state;

    if (!isFetching) return null;
    return <ActivityIndicator style={{color: '#000'}} />;
  };

  _renderItem = ({item, index}) => {
    const {isVideoLoading, isVideoPause} = this.state;

    if (this._curIndex != index || isVideoPause) {
      return (
        <View
          style={{
            width: '100%',
            height: VIDEO_HEIGHT,
            borderWidth: 1,
            borderColor: 'black',
          }}></View>
      );
    } else {
      const isLike = item.is_like ? true : false;
      const newTagList = item.tag_list.split(',').join(' ');

      return (
        <View
          style={{
            width: '100%',
            height: VIDEO_HEIGHT,
            borderWidth: 1,
            borderColor: 'black',
          }}>
          <Video
            source={{uri: convertToProxyURL(item.url)}}
            ref={(ref) => {
              this.player = ref;
            }}
            resizeMode="contain"
            repeat
            paused={isVideoPause}
            playWhenInactive={false}
            playInBackground={false}
            poster={item.thumb}
            posterResizeMode="contain"
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
          {isVideoLoading && (
            <View
              style={{
                marginTop: 16,
                height: '100%',
                alignSelf: 'center',
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
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
            }}>
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  this.onPressLike(!isLike, item);
                }}>
                <Image
                  source={ic_favorite}
                  style={{
                    ...GStyles.image,
                    width: 32,
                    tintColor: isLike ? GStyle.redColor : GStyle.activeColor,
                  }}></Image>
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
                }}>
                {item.like_count}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.onPressMessage(item);
                }}
                style={{marginTop: 18}}>
                <Image
                  source={ic_message}
                  style={{
                    ...GStyles.image,
                    width: 32,
                    tintColor: GStyle.activeColor,
                  }}></Image>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.onPressShare(item);
                }}
                style={{marginTop: 32}}>
                <FontAwesome
                  name="share"
                  style={{fontSize: 30, color: GStyle.activeColor}}
                />
              </TouchableOpacity>
              <View
                style={{
                  alignItems: 'center',
                  marginTop: 128,
                  marginBottom: 12,
                }}>
                <Text
                  style={{
                    ...GStyles.regularText,
                    color: 'black',
                    backgroundColor: 'white',
                    marginTop: 2,
                    paddingTop: 2,
                    paddingBottom: 1,
                    paddingHorizontal: 2,
                  }}>
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
                  }}>
                  #{item.number}
                </Text>
                <Avatar
                  image={{
                    uri: item.user_photo ? item.user_photo : img_default_avatar,
                  }}
                  size={48}
                  // borderRadius={29}
                  // borderWidth={1}
                  onPress={() => {
                    this.onPressAvatar(item);
                  }}
                  containerStyle={{marginTop: 4}}
                />
                <Text
                  style={{
                    ...GStyles.regularText,
                    maxWidth: 80,
                    color: 'white',
                  }}>
                  {item.user_name}
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
            }}>
            <View
              style={{
                alignItems: 'flex-start',
                marginTop: 128,
                marginBottom: 12,
              }}>
              <View style={{...GStyles.rowContainer, justifyContent: 'center'}}>
                <Text
                  style={{
                    ...GStyles.mediumText,
                    color: 'black',
                    backgroundColor: 'white',
                    padding: 2,
                    paddingBottom: 1,
                  }}>
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
                  }}>
                  {Constants.STICKER_NAME_LIST[Number(item.sticker)]}
                </Text>
                <View style={{flex: 1}}></View>
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
                }}>
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
                }}>
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
      <View style={{...GStyles.centerAlign, ...GStyles.absoluteContainer}}>
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
          }}>
          {this._renderShareTitle()}
          <View
            style={{...GStyles.rowContainer, justifyContent: 'space-around'}}>
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
      <View style={{...GStyles.centerAlign}}>
        <Text style={{...GStyles.regularText}}>Share to</Text>
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
        }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#3b5998',
          }}>
          <FontAwesome name="facebook" style={{fontSize: 30, color: 'white'}} />
        </View>
        <Text style={{fontSize: 14, paddingTop: 10, color: '#333'}}>
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
        }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#006fff',
          }}>
          <Fontisto name="messenger" style={{fontSize: 30, color: 'white'}} />
        </View>
        <Text style={{fontSize: 14, paddingTop: 10, color: '#333'}}>
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
        }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#25D366',
          }}>
          <FontAwesome name="whatsapp" style={{fontSize: 30, color: 'white'}} />
        </View>
        <Text style={{fontSize: 14, paddingTop: 10, color: '#333'}}>
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
        }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: GStyle.grayBackColor,
          }}>
          <FontAwesome name="download" style={{fontSize: 30, color: '#333'}} />
        </View>
        <Text style={{fontSize: 14, paddingTop: 10, color: '#333'}}>
          Save video
        </Text>
      </TouchableOpacity>
    );
  };

  _renderProgress = () => {
    const {percent, isVisibleProgress} = this.state;

    return (
      <ProgressModal
        percent={percent}
        isVisible={isVisibleProgress}></ProgressModal>
    );
  };

  ___renderStatusBar = () => {
    return <StatusBar backgroundColor="red" barStyle="light-content" />;
  };
}

const styles = {};

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <ProfileVideoScreen {...props} navigation={navigation} route={route} />
  );
}
