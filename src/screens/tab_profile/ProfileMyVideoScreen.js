import React from 'react';
import {
  Alert,
  BackHandler,
  Button,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {useNavigation, useRoute, StackActions} from '@react-navigation/native';

import {connect} from 'react-redux';
import {setMyPostCount} from '../../redux/me/actions';

import {NavigationContext} from '@react-navigation/native';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import FastImage from 'react-native-fast-image';
import RBSheet from 'react-native-raw-bottom-sheet';
import Animated from 'react-native-reanimated';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {TextField} from '../../lib/MaterialTextField/index';
import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
  RestAPI,
} from '../../utils/Global/index';
import GHeaderBar from '../../components/GHeaderBar';
import Avatar from '../../components/elements/Avatar';

import ProfileEditScreen from './ProfileEditScreen';
import ProfileEditScreen1 from './ProfileEditScreen';

const img_default_avatar = require('../../assets/images/ic_default_avatar.png');

const WINDOW_WIDTH = Helper.getWindowWidth();
const CELL_WIDTH = (WINDOW_WIDTH * 0.88) / 3.0 - 3;

class ProfileMyVideoScreen extends React.Component {
  static contextType = NavigationContext;

  constructor(props) {
    super(props);

    console.log('ProfileMyVideoScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.onRefresh();
      Helper.callFunc(global.setBottomTabName('profile'));
    });
  }

  componentWillUnmount() {
    this.unsubscribe();

    this._isMounted = false;
  }

  init = () => {
    this.state = {
      itemDatas: [],
    };

    this._isMounted = false;
    this._selItem = null;
  };

  onRefresh = () => {
    let params = {
      user_id: global.me.id,
      page_number: '1',
      count_per_page: '1000',
    };
    showPageLoader(true);
    RestAPI.get_user_video_list(params, (json, err) => {
      showPageLoader(false);

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 1) {
          if (this._isMounted) {
            this.setState({itemDatas: json.data.video_list});
            this.props.setMyPostCount(json.data.video_list.length);
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onPressVideo = (value) => {
    const {itemDatas} = this.state;
    const selIndex = itemDatas.findIndex((obj) => obj.id === value);

    global._selIndex = selIndex;
    global._profileMyVideoDatas = itemDatas;
    global._prevScreen = 'profile_my_video';
    const pushAction = StackActions.push('profile_video', null);
    this.props.navigation.dispatch(pushAction);
  };

  onPressOutStock = () => {
    const {itemDatas} = this.state;

    this._selItem.sticker = 1;
    this.bottomMenu.close();
    this.setState({itemDatas});

    this.updateVideoSticker();
  };

  onPressSpecialOffer = () => {
    const {itemDatas} = this.state;

    this._selItem.sticker = 2;
    this.bottomMenu.close();
    this.setState({itemDatas});

    this.updateVideoSticker();
  };

  onPressFreeDelivery = () => {
    const {itemDatas} = this.state;

    this._selItem.sticker = 3;
    this.bottomMenu.close();
    this.setState({itemDatas});

    this.updateVideoSticker();
  };

  onPressNoSticker = () => {
    const {itemDatas} = this.state;

    this._selItem.sticker = 0;
    this.bottomMenu.close();
    this.setState({itemDatas});

    this.updateVideoSticker();
  };

  updateVideoSticker = () => {
    let params = {
      video_id: this._selItem.id,
      sticker: this._selItem.sticker,
    };
    RestAPI.update_video_sticker(params, (json, err) => {});
  };

  render() {
    const {itemDatas} = this.state;

    return (
      <>
        <View style={{...GStyles.centerAlign}}>
          <View
            style={{
              width: '88%',
              height: '100%',
            }}>
            {this._renderVideo()}

            <RBSheet
              ref={(ref) => {
                this.bottomMenu = ref;
              }}
              height={200}
              closeOnDragDown
              openDuration={250}
              customStyles={{
                container: {
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                },
              }}>
              <View
                style={{
                  ...GStyles.rowContainer,
                  justifyContent: 'space-around',
                }}>
                {this._renderBottomMenu()}
              </View>
            </RBSheet>
          </View>
        </View>
      </>
    );
  }

  _renderBottomMenu = () => (
    <View style={{width: '100%'}}>
      <TouchableOpacity
        onPress={this.onPressOutStock}
        style={{...styles.panelButton}}>
        <Text style={styles.panelButtonTitle}>Out of stock</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={this.onPressSpecialOffer}
        style={styles.panelButton}>
        <Text style={styles.panelButtonTitle}>Special offer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={this.onPressFreeDelivery}
        style={styles.panelButton}>
        <Text style={styles.panelButtonTitle}>Free delivery</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={this.onPressNoSticker}
        style={styles.panelButton}>
        <Text style={styles.panelButtonTitle}>No Sticker</Text>
      </TouchableOpacity>
    </View>
  );

  _renderVideo = () => {
    const {itemDatas} = this.state;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginVertical: 50,
        }}>
        {itemDatas.map((item, i) => {
          return (
            <View
              key={i}
              style={{
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'white',
              }}>
              <View
                style={{
                  ...GStyles.centerAlign,
                  width: 52,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: 'lightgray',
                  marginVertical: 4,
                }}>
                <Text style={{...GStyles.mediumText}}>{item.number}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.onPressVideo(item.id);
                }}
                onLongPress={() => {
                  this._selItem = item;
                  this.bottomMenu.open();
                }}>
                <FastImage
                  source={{uri: item.thumb}}
                  resizeMode={FastImage.resizeMode.stretch}
                  style={{
                    width: CELL_WIDTH,
                    height: 120,
                  }}
                />
                <View
                  style={{
                    ...GStyles.rowContainer,
                    position: 'absolute',
                    right: 12,
                    bottom: 32,
                  }}>
                  <Text
                    style={{
                      ...GStyles.regularText,
                      fontSize: 10,
                      color: 'black',
                      backgroundColor:
                        item.sticker > 0 ? 'white' : 'transparent',
                      padding: 2,
                    }}>
                    {Constants.STICKER_NAME_LIST[Number(item.sticker)]}
                  </Text>
                </View>
                <View
                  style={{
                    ...GStyles.rowContainer,
                    position: 'absolute',
                    right: 12,
                    bottom: 12,
                    backgroundColor: 'white',
                    paddingVertical: 2,
                    paddingHorizontal: 4,
                  }}>
                  <FontAwesome
                    name="group"
                    style={{fontSize: 16, color: 'black'}}
                  />
                  <Text
                    style={{
                      ...GStyles.regularText,
                      fontSize: 13,
                      color: 'black',
                      marginLeft: 4,
                    }}>
                    {item.view_count}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };
}

const styles = StyleSheet.create({
  panelButton: {
    width: '100%',
    height: 36,
    backgroundColor: GStyle.grayBackColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 1,
  },
  panelButtonTitle: {
    fontSize: 14,
  },
});

TProfileMyVideoScreen = function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <ProfileMyVideoScreen {...props} navigation={navigation} route={route} />
  );
};

export default connect((state) => ({}), {setMyPostCount})(
  TProfileMyVideoScreen,
);
