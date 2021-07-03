import React, { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';

import { GStyle, Helper, RestAPI } from '../utils/Global';
import TopUsersScreen from '../screens/tab_top/TopUsersScreen';
import HomeMainScreen from '../screens/tab_home/HomeMainScreen';
import BrowseRooms from '../screens/tab_liveStream/BrowseRooms';
import ProfileMainScreen from '../screens/tab_profile/ProfileMainScreen';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { connect } from 'react-redux';
import { setUnreadCount } from '../redux/message/actions';
import avatars from '../assets/avatars';
import { setMyUserAction } from '../redux/me/actions';
import PlayMainScreen from '../screens/tab_play/PlayMainScreen';
import BottomTab from "./BottomTab";

const ic_tab_play = require('../assets/images/Icons/ic_tab_play.png');
const ic_tab_home = require('../assets/images/Icons/ic_gift.png');
const ic_tab_top = require('../assets/images/Icons/ic_tab_top.png');
const ic_tab_liveStream = require('../assets/images/Icons/ic_tab_liveStream.png');

const Tab = createBottomTabNavigator();

let BOTTOM_TAB_HEIGHT = 50 + Helper.getBottomBarHeight();

const TabBarVisibilityOptions = ({ route }) => {
  const isNestedRoute: boolean = route.state?.index > 0;

  return { tabBarVisible: !isNestedRoute };
};

const MainTabNavigator = (props) => {

  const user = props.user;
  const unreadCount = props.unreadCount || 0;

  useEffect(() => {
    console.log('MainTabNavigator start');
    init();
  }, []);


  const init = () => {

    global.onSetUnreadCount = onSetUnreadCount;
    global.onGotoMessage = onGotoMessage;
  };

  const onSetUnreadCount = () => {
    let params = {
      user_id: global.me?.id,
    };
    //showForcePageLoader(true);
    RestAPI.get_unread_count(params, (json, err) => {
      showForcePageLoader(false);

      if (json.status === 200) {
        props.setUnreadCount(json.data?.unreadCount || 0);
      }
    });
  };

  const onGotoMessage = async () => {
    await Helper.setDeviceId();
    await Helper.hasPermissions();

    showForcePageLoader(true);
    props.navigation.navigate('message');
  };

  return (
    <Tab.Navigator
      initialRouteName="play"
      tabBarOptions={{
        // activeTintColor: curTabName === 'play' ? 'white' : GStyle.blackColor,
        // inactiveTintColor: curTabName === 'play' ? 'white' : GStyle.grayColor,
        style: {
          height: BOTTOM_TAB_HEIGHT,
          backgroundColor: 'white',
          position:'absolute',
            // curTabName === 'play' || curTabName === 'profile_other'
            //   ?
            //   : 'relative',
          elevation: 0,
        },
        showLabel: false,
      }}
      //tabBar={props => <BottomTab {...props} />}
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
      />
      <Tab.Screen
        name="play"
        component={PlayMainScreen}
        options={{
          tabBarLabel: 'Play',
          tabBarIcon: ({ color, size }) => (
            <Image source={ic_tab_play} style={[styles.tabIconImage]} />
          ),
        }}
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
      />
      <Tab.Screen
        name="live_stream"
        component={BrowseRooms}
        options={{
          tabBarLabel: 'LiveStream',
          tabBarIcon: ({ color, size }) => (
            <Image source={ic_tab_liveStream} style={styles.tabIconImage} />
          ),
          tabBarBadgeStyle: { backgroundColor: 'red' },
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            if (!user) {
              e.preventDefault();
              this.props.navigation.navigate('signin');
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

            const avatarImage = { uri: user?.photo ?? randomImageUrl };
            return (
              <Image
                source={avatarImage}
                style={[styles.tabIconImage, styles.profileIcon]}
              />
            );
          },
          ...(unreadCount > 0 && { tabBarBadge: unreadCount }),
          tabBarBadgeStyle: { backgroundColor: 'red', fontSize: 12 },
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            if (!user) {
              e.preventDefault();
              this.props.navigation.navigate('signin');
            }
          },
        })}
      />
    </Tab.Navigator>
  );
}

export default connect(
  (state) => ({
    user: state.me?.user,
    unreadCount: state.message?.unreadCount || 0,
  }),
  {
    setUnreadCount,
    setMyUserAction,
  },
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
