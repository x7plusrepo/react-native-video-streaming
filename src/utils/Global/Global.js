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

import {GStyle, GStyles, Helper, Constants, RestAPI} from './index';

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

    params = {
      user_id: global.me.id,
      one_signal_id: global._pushAppId,
      token: global._pushToken,
      device_id: global._deviceId,
      device_type: Platform.OS === 'ios' ? '1' : '0',
    };
    showPageLoader(true);
    RestAPI.register_push_token(params, (json, err) => {
      showPageLoader(false);

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status !== 1) {
          Helper.alertServerDataError();
        }
      }
    });
  },
};

export default Global;
