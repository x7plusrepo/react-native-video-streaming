import React, {Component} from 'react';
import {
  Alert,
  BackHandler,
  Button,
  Dimensions,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
  RestAPI,
} from '../utils/Global/index';
import PlayTabScreen from '../screens/tab_play/PlayTabScreen';
import TopUsersScreen from '../screens/tab_top/TopUsersScreen';
import HomeMainScreen from '../screens/tab_home/HomeMainScreen';
import MessageMainScreen from '../screens/tab_message/MessageMainScreen';
import ProfileMainScreen from '../screens/tab_profile/ProfileMainScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {connect} from 'react-redux';
import {setUnreadCount} from '../redux/message/actions';

const ic_tab_play = require('../assets/images/ic_tab_play.png');
const ic_tab_home = require('../assets/images/ic_tab_home.png');
const ic_tab_top = require('../assets/images/ic_tab_top.png');
const ic_tab_profile = require('../assets/images/ic_tab_profile.png');
const ic_tab_messages = require('../assets/images/ic_tab_messages.png');

const Tab = createBottomTabNavigator();

let BOTTOM_TAB_HEIGHT = 50 + Helper.getBottomBarHeight();

class MainTabNavigator extends Component {
  constructor(props) {
    super(props);

    console.log('MainTabNavigator start');

    this.init();
  }

  init = () => {
    this.state = {
      curTabName: 'play',
    };

    global.onSetUnreadCount = this.onSetUnreadCount;
    global.onGotoMessageTab = this.onGotoMessageTab;

    global.setBottomTabName = (curTabName) => {
      this.setState({curTabName});
    };
  };

  onSetUnreadCount = () => {
    let params = {
      user_id: global.me.id,
    };
    showPageLoader(true);
    RestAPI.get_unread_count(params, (json, err) => {
      showPageLoader(false);

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 1) {
          const unreadCount =
            json.data.unread_count > 0 ? json.data.unread_count : null;
          this.props.setUnreadCount(unreadCount);
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onGotoMessageTab = async () => {
    await Helper.setDeviceId();
    Helper.hasPermissions();

    showForcePageLoader(true);

    const username = await Helper.getLocalValue(Constants.KEY_USERNAME);
    const password = await Helper.getLocalValue(Constants.KEY_PASSWORD);

    let params = {
      username: username ? username : 'guest_' + global._devId,
      password: password ? password : '',
    };
    RestAPI.signin_or_signup(params, (json, err) => {
      showPageLoader(false);

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 1) {
          global.me = json.data;

          if (global.me.username.indexOf('guest_') > -1) {
            global.me.isGuest = true;
          } else {
            global.me.isGuest = false;
          }

          Global.registerPushToken();
          this.props.navigation.navigate('message');
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  render() {
    const {curTabName} = this.state;
    const {unreadCount} = this.props;

    return (
      <>
        <SafeAreaView
          style={{
            flex: 0,
            backgroundColor: curTabName == 'play' ? 'transparent' : 'white',
          }}
        />
        <Tab.Navigator
          initialRouteName="play"
          tabBarOptions={{
            activeTintColor: curTabName == 'play' ? 'white' : GStyle.blackColor,
            inactiveTintColor:
              curTabName == 'play' ? 'white' : GStyle.grayColor,
            style: {
              height: BOTTOM_TAB_HEIGHT,
              backgroundColor: curTabName == 'play' ? 'transparent' : 'white',
              position:
                curTabName == 'play' || curTabName == 'profile_other'
                  ? 'absolute'
                  : 'relative',
              elevation: 0,
              // borderTopWidth: 0,
            },
          }}
          // sceneContainerStyle={{backgroundColor: 'transparent'}}
        >
          {/* <Tab.Screen
            name="camera"
            component={CameraMainScreen}
            options={{
              tabBarLabel: 'Camera',
              tabBarIcon: ({color, size}) => (
                <Image
                  source={ic_tab_camera}
                  style={{...GStyles.image, width: 20, tintColor: color}}
                />
              ),
              style: {
                backgroundColor: 'white',
              },
              tabBarVisible: false,
            }}
            listeners={({navigation, route}) => ({
              tabPress: (e) => {
                Global.registerPushToken();
              },
            })}
          /> */}
          <Tab.Screen
            name="top"
            component={TopUsersScreen}
            options={{
              tabBarLabel: 'Top',
              tabBarIcon: ({color, size}) => (
                <Image
                  source={ic_tab_top}
                  style={{...GStyles.image, width: 20, tintColor: color}}
                />
              ),              
            }}
            listeners={({navigation, route}) => ({
              tabPress: (e) => {
                Global.registerPushToken();
              },
            })}
          />
          <Tab.Screen
            name="play"
            component={PlayTabScreen}
            options={{
              tabBarLabel: 'Play',
              tabBarIcon: ({color, size}) => (
                <Image
                  source={ic_tab_play}
                  style={{...GStyles.image, width: 20, tintColor: color}}
                />
              ),
              tabBarVisible: curTabName == 'profile_other' ? false : true,
            }}
            listeners={({navigation, route}) => ({
              tabPress: (e) => {
                Global.registerPushToken();
              },
            })}
          />
          <Tab.Screen
            name="home"
            component={HomeMainScreen}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({color, size}) => (
                <Image
                  source={ic_tab_home}
                  style={{...GStyles.image, width: 20, tintColor: color}}
                />
              ),
            }}
            listeners={({navigation, route}) => ({
              tabPress: (e) => {
                Global.registerPushToken();
              },
            })}
          />
          <Tab.Screen
            name="message"
            component={MessageMainScreen}
            options={{
              tabBarLabel: 'Message',
              tabBarIcon: ({color, size}) => (
                <Image
                  source={ic_tab_messages}
                  style={{...GStyles.image, width: 20, tintColor: color}}
                />
              ),
              tabBarBadge: unreadCount,
              tabBarBadgeStyle: {backgroundColor: 'red'},
            }}
            listeners={({navigation, route}) => ({
              tabPress: (e) => {
                if (!global.me) {
                  e.preventDefault();
                  this.props.navigation.navigate('signin');
                  Global.registerPushToken();
                }
              },
            })}
          />
          <Tab.Screen
            name="profile"
            component={ProfileMainScreen}
            options={{
              tabBarLabel: 'Me',
              tabBarIcon: ({color, size}) => (
                <Image
                  source={ic_tab_profile}
                  style={{...GStyles.image, width: 20, tintColor: color}}
                />
              ),
            }}
            listeners={({navigation, route}) => ({
              tabPress: (e) => {
                if (!global.me) {
                  e.preventDefault();
                  this.props.navigation.navigate('signin');
                  Global.registerPushToken();
                }
              },
            })}
          />
        </Tab.Navigator>
      </>
    );
  }
}

export default connect(
  (state) => ({
    unreadCount: state.Message.unreadCount,
  }),
  {setUnreadCount},
)(MainTabNavigator);
