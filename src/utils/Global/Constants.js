import {Dimensions, Alert, Platform, StatusBar} from 'react-native';

const Constants = {
  //** key */
  PAY_STACK_PUB_KEY: 'pk_test_dbd30ba86e6fe5dd0cf839208fff9be36b36e260',
  MAP_API_KEY: 'AIzaSyDUNFhK6gsWN2V-A5E69R5e7vXQhLExrFw',
  DEFAULT_CAR: require('../../assets/default_car_avatar.png'),
  IMAGE_URL_PREFIX: 'https://pictostorage.s3.amazonaws.com/',
  GOOGLE_API_KEY: 'AIzaSyBYWssWxa3wRKMeazm2maDJnGNF0RRf0o8',

  //** local save key */
  KEY_USERNAME: 'KEY_USERNAME',
  KEY_PASSWORD: 'KEY_PASSWORD',
  KEY_VIDEO_DRAFT: 'KEY_VIDEO_DRAFT',

  //** url */
  // crn_dev
  HOST_URL: 'http://107.180.73.164/stars/',
  SOCKET_URL: 'http://107.180.73.164:5000/ChatStream',
  // HOST_URL: 'http://192.168.1.77/',
  // SOCKET_URL: 'http://192.168.1.77:5000/ChatStream',
  BASE_URL: 'http://wichz.com/api/',
  GOOGLE_PLAY_URL:
    'https://play.google.com/store/apps/details?id=com.stars.android',
  APPSTORE_URL: 'https://apps.apple.com/us/app/stars/id1543058540',

  //** socket */
  MESSAGE_TYPE_TEXT: 1,
  MESSAGE_TYPE_FILE: 2,
  MESSAGE_TYPE_LOCATION: 3,
  MESSAGE_TYPE_CONTACT: 4,
  MESSAGE_TYPE_STICKER: 5,

  MESSAGE_TYPE_STREAM: 0,
  MESSAGE_TYPE_COMMENT: 1,

  MESSAGE_NEW_USER: 1000,
  MESSAGE_USER_LEAVE: 1001,

  SOCKET_ERROR: 'socketerror',
  SOCKET_LOGIN: 'login',
  SOCKET_LOGOUT: 'logout',
  SOCKET_NEW_USER: 'newUser',
  SOCKET_FETCH_MESSAGE_LIST: 'FetchMessageList',
  SOCKET_NEW_MESSAGE: 'newMessage',
  SOCKET_SEND_MESSAGE: 'sendMessage',
  SOCKET_SEND_TYPING: 'sendTyping',
  SOCKET_TYPING: 'typing',
  SOCKET_OPEN_MESSAGE: 'openMessage',
  SOCKET_UPDATE_MESSAGE: 'messageUpdated',
  SOCKET_DELETE_MESSAGE: 'deleteMessage',
  SOCKET_CHANGE_MESSAGE: 'MessageChanges',
  SOCKET_DELETE_DURATION_MESSAGE: 'deleteDurationMessage',
  SOCKET_DISCONNECT: 'disconnect',
  SOCKET_USER_LEFT: 'userLeft',
  SOCKET_JOIN_STREAM: 'joinStream',
  SOCKET_STREAM: 'stream',
  SOCKET_STREAM_COMMENT: 'streamComment',

  NOTIFICATION_SEND_MESSAGE: 'SendMessage',
  NOTIFICATION_NEW_USER: 'NewUser',
  NOTIFICATION_USER_LEFT: 'UserLeft',
  NOTIFICATION_USER_TYPING: 'UserTyping',
  NOTIFICATION_MESSAGE_CHANGES: 'MessageChanges',
  NOTIFICATION_MESSAGE_DELETED: 'MessageDeleted',
  NOTIFICATION_SEND_STREAM: 'SendStream',
  NOTIFICATION_SEND_STREAM_COMMENT: 'SendStreamComment',

  ERROR_CODES: {
    1000001: 'Name is not provided.',
    1000002: 'Room ID is not provided.',
    1000003: 'User ID is not provided.',
    1000004: 'Room ID is not provided.',
    1000005: 'Roomo ID is not provided.',
    1000006: 'Last Meesage ID is not provided.',
    1000007: 'File not provided.',
    1000008: 'Room ID not provided.',
    1000009: 'User ID is not provided.',
    1000010: 'Type is not provided.',
    1000011: 'File is not provided.',
    1000012: 'Unknown Error',
    1000013: 'User ID is not provided.',
    1000014: 'Message ID is not provided.',
    1000015: 'Room ID is not provided.',
    1000016: 'User ID is not provided.',
    1000017: 'Type is not provided.',
    1000018: 'Message is not provided.',
    1000019: 'Location is not provided.',
    1000020: 'Failed to send message.',
    1000027: 'Invalid token',
    2001: 'Invalid parameter',
  },

  //** constant */
  WINDOW_WIDTH: Dimensions.get('window').width,
  WINDOW_HEIGHT: Dimensions.get('window').height,
  CELL_WIDTH: (Dimensions.get('window').width - 50) / 3,

  SUCCESS_TITLE: 'Success!',
  WARNING_TITLE: 'Warning!',
  ERROR_TITLE: 'Oops!',
  COUNT_PER_PAGE: 12,
  BOTTOM_TAB_HEIGHT: 50,
  KEY_UNREAD_MESSAGE_COUNT: 'KEY_UNREAD_MESSAGE_COUNT',
  DELAY_FOR_RENDER: 30,

  STICKER_NAME_LIST: ['', 'Out of stock', 'Special offer', 'Free delivery'],
  Months3: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Org',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  Weeks3: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

export default Constants;
