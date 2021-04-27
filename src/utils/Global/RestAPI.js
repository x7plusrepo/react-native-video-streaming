import RNFetchBlob from 'rn-fetch-blob';
import Helper from './Util';
import Constants from './Constants';
import { formDataCall } from './ApiBase';

const RestAPI = {
  ErrCode: {
    EmailExist: 101,
    InvalidParams: 102,
    PackageInvalid: 103,
    RegisterFailed: 104,
  },

  login: (params, callBack) => {
    const data = {
      username: params.username,
      password: params.password,
    };

    formDataCall('api/auth/login', data, {}, callBack, 'post');
  },

  signup: (params, callBack) => {
    const data = {
      username: params.username,
      phone: params.phone,
      password: params.password,
    };

    formDataCall('api/auth/register', data, {}, callBack, 'post');
  },

  signin_or_signup: (params, callBack) => {
    const data = {
      username: params.username,
      password: params.password,
    };

    formDataCall('api/auth/loginOrRegister', data, {}, callBack, 'post');
  },

  update_profile_with_image: (params, callBack) => {
    let data = {
      userId: params.user_id,
      username: params.username,
      phone: params.phone,
      photo: params.photo,
    };

    if (params.photo) {
      data.photo = params.photo;
    }

    if (params.password) {
      data.password = params.password;
    }

    formDataCall('api/profile', data, {}, callBack, 'put');
  },

  add_video: (params, callBack) => {
    const data = {
      userId: params.user_id,
      url: params.uploaded_url,
      tags: params.tags,
      price: params.price,
      description: params.description,
      number: params.number,
      thumb: params.thumb,
    };
    formDataCall('api/video', data, {}, callBack, 'post');
  },

  get_user_video_list: (params, callBack) => {
    const data = {
      meId: params.me_id,
      userId: params.user_id,
      page: params.page_number,
      amount: params.count_per_page,
    };

    formDataCall('api/video/userVideo', data, {}, callBack, 'get');
  },

  get_liked_video_list: (params, callBack) => {
    const data = {
      userId: params.user_id,
      page: params.page_number,
      amount: params.count_per_page,
    };

    formDataCall('api/video/likedVideos', data, {}, callBack, 'get');
  },

  get_all_video_list: (params, callBack) => {
    const data = {
      userId: params.user_id,
      page: params.page_number,
      amount: params.count_per_page,
      username: params.username,
      password: params.password,
    };

    formDataCall('api/video/allVideo', data, {}, callBack, 'get');
  },

  get_filtered_video_list: (params, callBack) => {
    const data = {
      userId: params.user_id,
      page: params.page_number,
      amount: params.count_per_page,
      keyword: params.keyword,
    };

    formDataCall('api/video/filteredVideo', data, {}, callBack, 'get');
  },

  get_quick_search_video_list: (params, callBack) => {
    const data = {
      userId: params.user_id,
      page: params.page_number,
      amount: params.count_per_page,
      keyword: params.keyword,
    };

    formDataCall('api/video/filteredVideo', data, {}, callBack, 'get');
  },

  get_room_list: (params, callBack) => {
    const data = {
      userId: params.user_id,
      page: params.page_number,
      amount: params.count_per_page,
    };

    formDataCall('api/productChat/roomList', data, {}, callBack, 'get');
  },

  get_liveStream_list: (params, callBack) => {
    const data = {
      userId: params.user_id,
      page: params.page_number,
      amount: params.count_per_page,
    };

    formDataCall('api/liveStream/all', data, {}, callBack, 'get');
  },

  get_liveStream: (params, callBack) => {
    const data = {
      id: params.roomId,
    };

    formDataCall('api/liveStream', data, {}, callBack, 'get');
  },

  get_unread_count: (params, callBack) => {
    const data = {
      userId: params.user_id,
    };

    formDataCall('api/productChat/unReadCounts', data, {}, callBack, 'get');
  },

  set_read_status: (params, callBack) => {
    const data = {
      userId: params.user_id,
      otherId: params.other_id,
    };

    formDataCall('api/productChat/readStatus', data, {}, callBack, 'patch');
  },

  get_message_list: (params, callBack) => {
    if (global.socket) {
      global.socket.emit(Constants.SOCKET_FETCH_MESSAGE_LIST, params);
    } else {
      callBack('error');
    }
  },

  send_message: (params, callBack) => {
    if (global.socket) {
      global.socket.emit(Constants.SOCKET_SEND_MESSAGE, params);
    } else {
      callBack('error');
    }
  },

  register_push_token: (params, callBack) => {
    const data = {
      userId: params.user_id,
      oneSignalId: params.one_signal_id,
      token: params.token,
      deviceId: params.device_id,
      deviceType: params.device_type,
    };

    formDataCall('api/auth/registerPushToken', data, {}, callBack, 'put');
  },

  update_like_video: (params, callBack) => {
    const data = {
      userId: params.user_id,
      videoId: params.video_id,
      isLiked: params.is_like,
    };

    formDataCall('api/video/like', data, {}, callBack, 'put');
  },

  get_filtered_user_list: (params, callBack) => {
    const data = {
      userId: params.user_id,
      page: params.page_number,
      amount: params.count_per_page,
      keyword: params.keyword,
    };

    formDataCall('api/user/all', data, {}, callBack, 'get');
  },

  get_top_user_list: (params, callBack) => {
    const data = {
      page: params.page_number,
      amount: params.count_per_page,
    };

    formDataCall('api/user/topUsers', data, {}, callBack, 'get');
  },

  update_video_view: (params, callBack) => {
    console.log(params);
    const data = {
      videoId: params.video_id,
      ownerId: params.owner_id,
      viewerId: params.viewer_id,
      deviceType: params.device_type,
      deviceIdentifier: params.device_identifier,
    };

    formDataCall('api/video/view', data, {}, callBack, 'put');
  },

  update_video_sticker: (params, callBack) => {
    const data = {
      videoId: params.video_id,
      sticker: params.sticker,
    };

    formDataCall('api/video/sticker', data, {}, callBack, 'patch');
  },

  get_user_profile: (params, callBack) => {
    const data = {
      userId: params.user_id,
    };

    formDataCall('api/profile', data, {}, callBack, 'get');
  },

  get_chat_title: (params, callBack) => {
    formDataCall('api/message/chatTitle', {}, {}, callBack, 'get');
  },

  update_user_like: (params, callBack) => {
    const data = {
      userId: params.user_id,
      otherId: params.other_id,
      type: params.type,
    };

    formDataCall('api/user/like', data, {}, callBack, 'put');
  },
};

export default RestAPI;
