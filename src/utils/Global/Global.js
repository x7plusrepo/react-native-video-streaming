import {
  Dimensions,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Constants, GStyle, GStyles, Helper, RestAPI } from './index';
import branch from 'react-native-branch';
import axios from 'axios';
import Video from 'react-native-video';
import convertToProxyURL from 'react-native-video-cache';
import Avatar from '../../components/elements/Avatar';
import React from 'react';

import avatars from '../../assets/avatars';

const heart = require('../../assets/images/gifts/heart.png');
const ic_menu_messages = require('../../assets/images/Icons/ic_menu_messages.png');
const ic_share = require('../../assets/images/Icons/ic_share.png');
const ic_support = require('../../assets/images/Icons/ic_support.png');
const ic_diamond = require('../../assets/images/Icons/ic_diamond.png');

const randomNumber = Math.floor(Math.random() * avatars.length);
const randomImageUrl = avatars[randomNumber];
const VIDEO_HEIGHT = Dimensions.get('screen').height;

const Global = {
  email: '',
  first_name: '',
  last_name: '',
  username: '',
  avatar_url: '',
  created_at: 0,
  user_loc_lat: 0.0,
  user_loc_lng: 0.0,
  user_current_address: '',
  acc_tmp_lat: 0.0,
  acc_tmp_lng: 0.0,

  discounts_likes_list: [],
  cards_likes_list: [],

  category_list: [],
  search_hotkeys: [],
  search_word: '',
  selected_discount: {},
  previou_of_detail: '',

  bank_list: [],
  selected_card: {},

  selected_notification: {},

  registerPushToken: () => {
    if (
      !global.me ||
      !global._pushAppId ||
      !global._pushToken ||
      !global._deviceId
    ) {
      return;
    }

    const params = {
      user_id: global.me?.id,
      one_signal_id: global._pushAppId,
      token: global._pushToken,
      device_id: global._deviceId,
      device_type: Platform.OS === 'ios' ? '1' : '0',
    };
    //showForcePageLoader(true);
    RestAPI.register_push_token(params, (json, err) => {
      showForcePageLoader(false);

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status !== 204) {
          Helper.alertServerDataError();
        }
      }
    });
  },
  uploadToCloudinary: async (source, folder = 'unknown') => {
    return new Promise((resolve, reject) => {
      const data = new FormData();
      data.append('file', source);
      data.append('upload_preset', 'dmljgqvn');
      data.append('cloud_name', 'snaplist');
      data.append('folder', folder);
      data.append('api_key', '882925219281537');
      data.append('api_secret ', 'ppqMDgtivesiIut2_uC0rSylJHM');
      const url = 'https://api.cloudinary.com/v1_1/snaplist/upload';

      axios({
        url,
        method: 'POST',
        data: data,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          //'Authorization':'Basic YnJva2VyOmJyb2tlcl8xMjM='
        },
      })
        .then(function (response) {
          resolve(response?.data?.secure_url);
        })
        .catch(function (error) {
          console.log(error);
          resolve(null);
        });
    });
  },
  inviteToLiveStream: async (room, user) => {
    const userId = user?.id;
    const roomId = room?.id;

    const channelName = room?.topic || room?.roomName;
    const image = room?.thumbnail;

    const branchUniversalObject = await branch.createBranchUniversalObject(
      'canonicalIdentifier',
      {
        locallyIndex: true,
        title: 'Welcome to my channel.',
        contentImageUrl: image,
        contentDescription: '',
      },
    );

    const shareOptions = {
      messageHeader: 'Come to chat with me',
      messageBody: `${user?.username} invited you to channel ${channelName}!`,
    };
    const linkProperties = { feature: 'share', channel: 'facebook' };
    let controlParams = {
      roomId,
      inviterId: userId,
    };

    await branchUniversalObject.showShareSheet(
      shareOptions,
      linkProperties,
      controlParams,
    );
  },
  makeId: (length) => {
    const result = [];
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result.push(
        characters.charAt(Math.floor(Math.random() * charactersLength)),
      );
    }
    return result.join('');
  },
  renderVideo: (item, state, index, actions) => {
    const { isVideoPause } = state;
    const paused = isVideoPause || state.curIndex !== index;
    const user = item.user || {};
    const displayName = user?.userType === 0 ? user?.displayName : user?.username;
    const isLike = !!item.isLiked;
    const newTagList = item.tagList?.map((tag) => tag.name)?.join(' ');
    const categoryName = item?.category?.title || '';
    const subCategoryName = item?.subCategory?.title || '';

    return (
      <View
        style={{
          flex: 1,
          width: '100%',
          height: VIDEO_HEIGHT,
          backgroundColor: 'black',
        }}
      >
        {Math.abs(state.curIndex - index) < 3 && (
          <>
            <Video
              source={{ uri: convertToProxyURL(item.url || '') }}
              repeat
              paused={paused}
              playWhenInactive={false}
              playInBackground={false}
              poster={item.thumb}
              resizeMode="cover"
              posterResizeMode="contain"
              bufferConfig={{
                minBufferMs: 15000,
                maxBufferMs: 30000,
                bufferForPlaybackMs: 5000,
                bufferForPlaybackAfterRebufferMs: 5000,
              }}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
            <View style={GStyles.stickerWrapper}>
              {item.sticker > 0 && (
                <View style={GStyles.stickerContainer}>
                  <Text style={GStyles.stickerText}>
                    {Constants.STICKER_NAME_LIST[item.sticker]}
                  </Text>
                </View>
              )}
            </View>
            <View
              style={[
                GStyles.playInfoWrapper,
                { marginBottom: 64 + Helper.getBottomBarHeight() },
              ]}
            >
              <View style={GStyles.rowEndContainer}>
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      actions.onPressLike(!isLike, item);
                    }}
                    style={[GStyles.videoActionButton]}
                  >
                    <Image
                      source={heart}
                      style={{
                        ...GStyles.actionIcons,
                        tintColor: isLike ? GStyle.primaryColor : 'white',
                      }}
                    />
                  </TouchableOpacity>

                  {user.id !== global.me?.id && (
                    <TouchableOpacity
                      onPress={() => {
                        actions.onPressMessage(item);
                      }}
                      style={GStyles.videoActionButton}
                    >
                      <Image
                        source={ic_menu_messages}
                        style={GStyles.actionIcons}
                      />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      actions.onPressShare(item);
                    }}
                    style={GStyles.videoActionButton}
                  >
                    <Image source={ic_share} style={GStyles.actionIcons} />
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <View
                  style={[GStyles.rowBetweenContainer, { marginBottom: 8 }]}
                >
                  <View style={GStyles.rowContainer}>
                    <View style={GStyles.playInfoTextWrapper}>
                      <Text style={GStyles.playInfoText}>৳{item.price}</Text>
                    </View>
                    <View
                      style={[GStyles.playInfoTextWrapper, { marginLeft: 10 }]}
                    >
                      <Image
                        source={ic_support}
                        style={{ width: 12, height: 12, marginRight: 4 }}
                      />
                      <Text style={GStyles.playInfoText}>01913379598 </Text>
                    </View>
                    <View
                      style={[GStyles.playInfoTextWrapper, { marginLeft: 10 }]}
                    >
                      <Image
                        source={ic_diamond}
                        style={{ width: 12, height: 12, marginRight: 4 }}
                      />
                      <Text style={GStyles.playInfoText}>
                        {item.price / 10}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[GStyles.rowBetweenContainer, { marginBottom: 8 }]}
                >
                  <View style={GStyles.playInfoTextWrapper}>
                    <Text numberOfLines={3} style={GStyles.playInfoText}>
                      {`${
                        !!!categoryName && !!!subCategoryName ? newTagList : ''
                      } ${categoryName} ${subCategoryName}`}
                    </Text>
                  </View>

                  <View style={GStyles.playInfoTextWrapper}>
                    <Text style={GStyles.playInfoText}>#{item.number}</Text>
                  </View>
                </View>
                <View
                  style={[GStyles.rowBetweenContainer, { marginBottom: 8 }]}
                >
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
                        actions.onPressAvatar(item);
                      }}
                      containerStyle={{ marginBottom: 4 }}
                    />
                    <Text style={GStyles.textSmall}>{displayName}</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    );
  },
};

export default Global;
