import React, { Component } from 'react';
import { Image, StyleSheet, View } from 'react-native';

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
import BrowseRooms from '../screens/tab_liveStream/BrowseRooms';
import ProfileMainScreen from '../screens/tab_profile/ProfileMainScreen';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { connect } from 'react-redux';
import { setUnreadCount } from '../redux/message/actions';
import avatars from '../assets/avatars';
import { setMyUserAction } from '../redux/me/actions';

const ic_tab_play = require('../assets/images/Icons/ic_tab_play.png');
const ic_tab_home = require('../assets/images/Icons/ic_tab_home.png');
const ic_tab_top = require('../assets/images/Icons/ic_tab_top.png');
const ic_tab_liveStream = require('../assets/images/Icons/ic_tab_liveStream.png');

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
      this.setState({ curTabName });
    };
  };

  onSetUnreadCount = () => {
    let params = {
      user_id: global.me.id,
    };
    //showForcePageLoader(true);
    RestAPI.get_unread_count(params, (json, err) => {
      showForcePageLoader(false);

      if (err !== null) {
        Helper.alertNetworkError(err?.message);
      } else {
        if (json.status === 200) {
          const unreadCount =
            json.data.unReadCounts > 0 ? json.data.unReadCounts : null;
          this.props.setUnreadCount(unreadCount);
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onGotoMessageTab = async () => {
    await Helper.setDeviceId();
    await Helper.hasPermissions();

    showForcePageLoader(true);

    const username = await Helper.getLocalValue(Constants.KEY_USERNAME);
    const password = await Helper.getLocalValue(Constants.KEY_PASSWORD);

    let params = {
      username: username ? username : 'guest_' + global._devId,
      password: password ? password : '',
    };
    RestAPI.signin_or_signup(params, (json, err) => {
      showForcePageLoader(false);

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 200) {
          global.me = json.data || [];
          global.me.isGuest = global.me.username.indexOf('guest_') > -1;
          this.props.setMyUserAction(global.me);
          Global.registerPushToken();
          this.props.navigation.navigate('message');
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  render() {
    const { curTabName } = this.state;
    const { unreadCount } = this.props;

    return (
      <Tab.Navigator
        initialRouteName="play"
        tabBarOptions={{
          activeTintColor: curTabName === 'play' ? 'white' : GStyle.blackColor,
          inactiveTintColor: curTabName === 'play' ? 'white' : GStyle.grayColor,
          style: {
            height: BOTTOM_TAB_HEIGHT,
            backgroundColor: curTabName === 'play' ? 'transparent' : 'white',
            position:
              curTabName === 'play' || curTabName === 'profile_other'
                ? 'absolute'
                : 'relative',
            elevation: 0,
            // borderTopWidth: 0,
          },
          showLabel: false,
        }}
        // sceneContainerStyle={{backgroundColor: 'transparent'}}
      >
        <Tab.Screen
          name="top"
          component={TopUsersScreen}
          options={{
            tabBarLabel: 'Top',
            tabBarIcon: ({ color, size }) => (
              <Image source={ic_tab_top} style={styles.tabIconImage} />
            ),
          }}
          listeners={({ navigation, route }) => ({
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
            tabBarIcon: ({ color, size }) => (
              <Image source={ic_tab_play} style={styles.tabIconImage} />
            ),
            tabBarVisible: curTabName !== 'profile_other',
          }}
          listeners={({ navigation, route }) => ({
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
            tabBarIcon: ({ color, size }) => (
              <Image source={ic_tab_home} style={styles.tabIconImage} />
            ),
          }}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              Global.registerPushToken();
            },
          })}
        />
        <Tab.Screen
          name="live_stream"
          component={BrowseRooms}
          options={{
            tabBarLabel: 'LiveStream',
            tabBarIcon: ({ color, size }) => (
              <Image source={ic_tab_liveStream} style={styles.tabIconImage} />
            ),
            /*TODO - move to profile screen*/
            tabBarBadge: unreadCount,
            tabBarBadgeStyle: { backgroundColor: 'red' },
          }}
          listeners={({ navigation, route }) => ({
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
            tabBarIcon: ({ color, size }) => {
              const randomNumber = Math.floor(Math.random() * avatars.length);
              const randomImageUrl = avatars[randomNumber];

              const avatarImage = { uri: global?.me?.photo ?? randomImageUrl };
              return (
                <Image
                  source={avatarImage}
                  style={[styles.tabIconImage, styles.profileIcon]}
                />
              );
            },
          }}
          listeners={({ navigation, route }) => ({
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
    );
  }
}

export default connect(
  (state) => ({
    unreadCount: state.message.unreadCount,
  }),
  { setUnreadCount, setMyUserAction },
)(MainTabNavigator);

const styles = StyleSheet.create({
  tabIconImage: {
    width: 28,
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  homeIconContainer: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderRadius: 32,
  },
  homeIconInnerContainer: {
    width: 52,
    height: 52,
    backgroundColor: '#1BF2DD',
    borderRadius: 26,
  },
  profileIcon: {
    borderRadius: 16,
    overflow: 'hidden',
    resizeMode: 'cover',
  },
});
