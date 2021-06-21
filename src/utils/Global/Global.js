import {Platform} from 'react-native';
import {Helper, RestAPI} from './index';
import branch from 'react-native-branch';
import axios from 'axios';
import React from 'react';

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
    if (Platform.OS === 'ios') {
      console.log(source);
      source.uri = source?.uri?.replace('file://', '/');
    }
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
  shareProduct: async (product, user) => {
    const userId = user?.id;

    const newTagList = product.tagList?.map((tag) => tag.name)?.join(' ');
    const image = product?.thumb;

    const branchUniversalObject = await branch.createBranchUniversalObject(
      'canonicalIdentifier',
      {
        locallyIndex: true,
        title: 'View product',
        contentImageUrl: image,
        contentDescription: '',
      },
    );

    const shareOptions = {
      messageHeader: 'Come to chat with me',
      messageBody: `${user?.username} invited you to channel ${newTagList}!`,
    };
    const linkProperties = { feature: 'share', channel: 'facebook' };
    let controlParams = {
      product: JSON.stringify(product),
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
};

export default Global;
