import RNFetchBlob from 'rn-fetch-blob';
import Helper from './Util';
import Constants from './Constants';
import {formDataCall, formFileDataCall} from './ApiBase';

const RestAPI = {
  ErrCode: {
    EmailExist: 101,
    InvalidParams: 102,
    PackageInvalid: 103,
    RegisterFailed: 104,
  },

  login: (params, callBack) => {
    const data = new FormData();
    data.append('username', params.username);
    data.append('password', params.password);

    formDataCall('api/user/login', data, {}, callBack);
  },

  signup: (params, callBack) => {
    const data = new FormData();
    data.append('username', params.username);
    data.append('phone', params.phone);
    data.append('password', params.password);

    formDataCall('api/user/signup', data, {}, callBack);
  },

  signin_or_signup: (params, callBack) => {
    const data = new FormData();
    data.append('username', params.username);
    data.append('password', params.password);

    formDataCall('api/user/signin_or_signup', data, {}, callBack);
  },

  update_profile_with_image: (params, callBack) => {
    const fileName = 'avatar';
    const fileType = 'jpeg';

    let data = null;
    if (params.image) {
      data = [
        {name: 'user_id', data: params.user_id},
        {name: 'username', data: params.username},
        {name: 'phone', data: params.phone},
        {name: 'password', data: params.password},
        {
          name: 'image',
          filename: fileName,
          type: fileType,
          data: RNFetchBlob.wrap(params.image),
        },
      ];
      formFileDataCall('api/user/update_profile_with_image', data, callBack);
    } else {
      data = [
        {name: 'user_id', data: params.user_id},
        {name: 'username', data: params.username},
        {name: 'phone', data: params.phone},
        {name: 'password', data: params.password},
      ];
      formFileDataCall('api/user/update_profile', data, callBack);
    }
  },

  add_video: (params, callBack) => {
    const fileName = Helper.getFileName4Uri(params.image);
    const fileType = Helper.getFileExt4Uri(params.image);

    const data = [
      {name: 'user_id', data: params.user_id},
      {name: 'uploaded_url', data: params.uploaded_url},
      {name: 'tags', data: params.tags},
      {name: 'price', data: params.price},
      {name: 'description', data: params.description},
      {name: 'number', data: params.number},
      {
        name: 'image',
        filename: fileName,
        type: fileType,
        data: RNFetchBlob.wrap(params.image),
      },
    ];

    formFileDataCall('api/user/add_video', data, callBack);
  },

  get_user_video_list: (params, callBack) => {
    const data = new FormData();
    data.append('me_id', params.me_id);
    data.append('user_id', params.user_id);
    data.append('page_number', params.page_number);
    data.append('count_per_page', params.count_per_page);

    formDataCall('api/user/get_user_video_list', data, {}, callBack);
  },

  get_liked_video_list: (params, callBack) => {
    const data = new FormData();
    data.append('user_id', params.user_id);
    data.append('page_number', params.page_number);
    data.append('count_per_page', params.count_per_page);

    formDataCall('api/user/get_liked_video_list', data, {}, callBack);
  },

  get_all_video_list: (params, callBack) => {
    const data = new FormData();
    data.append('user_id', params.user_id);
    data.append('page_number', params.page_number);
    data.append('count_per_page', params.count_per_page);
    data.append('username', params.username);
    data.append('password', params.password);

    formDataCall('api/user/get_all_video_list', data, {}, callBack);
  },

  get_filtered_video_list: (params, callBack) => {
    const data = new FormData();
    data.append('user_id', params.user_id);
    data.append('page_number', params.page_number);
    data.append('count_per_page', params.count_per_page);
    data.append('keyword', params.keyword);

    formDataCall('api/user/get_filtered_video_list', data, {}, callBack);
  },

  get_quick_search_video_list: (params, callBack) => {
    const data = new FormData();
    data.append('user_id', params.user_id);
    data.append('page_number', params.page_number);
    data.append('count_per_page', params.count_per_page);
    data.append('keyword', params.keyword);

    formDataCall('api/user/get_quick_search_video_list', data, {}, callBack);
  },

  get_room_list: (params, callBack) => {
    const data = new FormData();
    data.append('user_id', params.user_id);
    data.append('page_number', params.page_number);
    data.append('count_per_page', params.count_per_page);

    formDataCall('api/message/get_room_list', data, {}, callBack);
  },

  get_unread_count: (params, callBack) => {
    const data = new FormData();
    data.append('user_id', params.user_id);

    formDataCall('api/message/get_unread_count', data, {}, callBack);
  },

  set_read_status: (params, callBack) => {
    const data = new FormData();
    data.append('user_id', params.user_id);
    data.append('other_id', params.other_id);

    formDataCall('api/message/set_read_status', data, {}, callBack);
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
    const data = new FormData();
    data.append('user_id', params.user_id);
    data.append('one_signal_id', params.one_signal_id);
    data.append('token', params.token);
    data.append('device_id', params.device_id);
    data.append('device_type', params.device_type);

    formDataCall('api/user/register_push_token', data, {}, callBack);
  },

  update_like_video: (params, callBack) => {
    const data = new FormData();
    data.append('user_id', params.user_id);
    data.append('video_id', params.video_id);
    data.append('is_like', params.is_like);

    formDataCall('api/user/update_like_video', data, {}, callBack);
  },

  get_filtered_user_list: (params, callBack) => {
    const data = new FormData();
    data.append('keyword', params.keyword);
    data.append('user_id', params.user_id);
    data.append('page_number', params.page_number);
    data.append('count_per_page', params.count_per_page);

    formDataCall('api/user/get_filtered_user_list', data, {}, callBack);
  },

  get_top_user_list: (params, callBack) => {
    const data = new FormData();
    data.append('page_number', params.page_number);
    data.append('count_per_page', params.count_per_page);

    formDataCall('api/user/get_top_user_list', data, {}, callBack);
  },

  update_video_view: (params, callBack) => {
    const data = new FormData();
    data.append('video_id', params.video_id);
    data.append('owner_id', params.owner_id);
    data.append('viewer_id', params.viewer_id);
    data.append('device_type', params.device_type);
    data.append('device_identifier', params.device_identifier);

    formDataCall('api/user/update_video_view', data, {}, callBack);
  },

  update_video_sticker: (params, callBack) => {
    const data = new FormData();
    data.append('video_id', params.video_id);
    data.append('sticker', params.sticker);

    formDataCall('api/user/update_video_sticker', data, {}, callBack);
  },

  get_user_profile: (params, callBack) => {
    const data = new FormData();
    data.append('user_id', params.user_id);

    formDataCall('api/user/get_user_profile', data, {}, callBack);
  },

  get_chat_title: (params, callBack) => {
    const data = new FormData();
    data.append('none', params.none);

    formDataCall('api/message/get_chat_title', data, {}, callBack);
  },

  update_user_like: (params, callBack) => {
    const data = new FormData();
    data.append('user_id', params.user_id);
    data.append('other_id', params.other_id);
    data.append('type', params.type);

    formDataCall('api/user/update_user_like', data, {}, callBack);
  },
};

export default RestAPI;
