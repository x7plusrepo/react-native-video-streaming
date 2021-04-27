import React from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { connect } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';

import Avatar from '../../components/elements/Avatar';
import avatars from '../../assets/avatars';

import { setMyUserAction } from '../../redux/me/actions';

import { GStyle, GStyles, Helper, RestAPI } from '../../utils/Global/index';

import ic_tab_liveStream from '../../assets/images/Icons/ic_tab_liveStream.png';
import ic_upload from '../../assets/images/Icons/ic_upload.png';
import ic_tab_play from '../../assets/images/Icons/ic_tab_play.png';
import ic_chevron_right from '../../assets/images/Icons/ic_chevron_right.png';
import ic_menu_messages from '../../assets/images/Icons/ic_menu_messages.png';
import ic_menu_fans from '../../assets/images/Icons/ic_menu_fans.png';
import ic_menu_drafts from '../../assets/images/Icons/ic_menu_drafts.png';
import ic_tab_top from '../../assets/images/Icons/ic_tab_top.png';
import ic_menu_downloads from '../../assets/images/Icons/ic_menu_downloads.png';
import ic_menu_saved_products from '../../assets/images/Icons/ic_menu_saved_products.png';
import ic_my_posts from '../../assets/images/Icons/ic_my_posts.png';
import ic_support from '../../assets/images/Icons/ic_support.png';
import ic_signIn from '../../assets/images/Icons/ic_signin.png';
import ic_signOut from '../../assets/images/Icons/ic_signout.png';

const getMenuItems = (navigation) => {
  let menu = [
    {
      icon: ic_tab_liveStream,
      title: 'Go Live',
      onPress: () => {
        navigation.navigate('go_live');
      },
    },
    {
      icon: ic_upload,
      title: 'Upload Products',
      onPress: () => {
        global._prevScreen = 'profile';
        navigation.navigate('camera_main');
      },
    },
    {
      icon: ic_tab_play,
      title: 'Release Reels',
      onPress: () => {},
    },
    {
      icon: ic_menu_messages,
      title: 'Messages',
      onPress: () => {},
    },
    {
      icon: ic_menu_fans,
      title: 'Fans',
      onPress: () => {},
    },
    {
      icon: ic_menu_downloads,
      title: 'Download',
      onPress: () => {},
    },
    {
      icon: ic_menu_drafts,
      title: 'Drafts',
      onPress: () => {
        navigation.navigate('camera_draft');
      },
    },
    {
      icon: ic_tab_top,
      title: 'Top',
      onPress: () => {},
    },
    {
      icon: ic_menu_saved_products,
      title: 'Saved Products',
      onPress: () => {
        navigation.navigate('saved_products');
      },
    },
    {
      icon: ic_my_posts,
      title: 'My Posts',
      onPress: () => {
        navigation.navigate('my_posts');
      },
    },
    {
      icon: ic_support,
      title: 'Customer Support',
      onPress: () => {
        global._roomId = '1';
        global._opponentName = 'Stars';
        navigation.navigate('message_chat');
      },
    },
  ];

  menu.push(
    global.me.isGuest
      ? {
          icon: ic_signIn,
          title: 'Sign In',
          onPress: () => {
            global._prevScreen = 'profile_edit';
            navigation.navigate('signin');
          },
        }
      : {
          icon: ic_signOut,
          title: 'Sign Out',
          onPress: () => {},
        },
  );

  return menu;
};

const WINDOW_HEIGHT = Helper.getWindowHeight();

class ProfileMainScreen extends React.Component {
  constructor(props) {
    super(props);
    this.scrollAnimatedValue = new Animated.Value(0);

    console.log('ProfileMainScreen start');

    this.init();
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('profile'));
      Helper.setLightStatusBar();
      this.onRefresh();
    });

    const curMonth = Helper.getCurMonthString();
    this.setState({ curMonth });
    const lastMonths = Helper.getLastMonthList();
    this.setState({ lastMonths });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  init = () => {
    this.state = {
      allViewCount: 0,
      monthViewCountList: [],

      tabOneHeight: WINDOW_HEIGHT,
      tabTwoHeight: WINDOW_HEIGHT,

      curMonth: '',
      lastMonths: [],
    };
  };

  onRefresh = () => {
    let params = {
      user_id: global.me.id,
    };
    //showForcePageLoader(true);
    RestAPI.get_user_profile(params, (json, err) => {
      showForcePageLoader(false);
      console.log(err);
      console.log(json);
      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 200) {
          const user = json.data || {};
          this.props.setMyUserAction({ ...user, isGuest: global.me?.isGuest });
          global.me.photo = json.data.photo;
          this.setState({
            allViewCount: json.data?.allViewCount,
            monthViewCountList: json.data?.monthViews,
          });
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onBack = () => {
    this.props.navigation.goBack();
  };

  onPressProfile = () => {
    this.props.navigation.navigate('profile_edit');
  };

  render() {
    const { user, navigation } = this.props;
    const randomNumber = Math.floor(Math.random() * avatars.length);
    const randomImageUrl = avatars[randomNumber];
    const avatarImage = {
      uri: user?.photo ?? randomImageUrl,
    };

    const translateY = this.scrollAnimatedValue.interpolate({
      inputRange: [0, 180],
      outputRange: [0, -280],
      extrapolate: 'clamp',
    });

    const opacity = this.scrollAnimatedValue.interpolate({
      inputRange: [0, 180],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const topAnimatedStyle = [
      {
        transform: [{ translateY }],
        opacity,
      },
      styles.topContainer,
      user.isGuest && { height: 250 },
    ];

    return (
      <SafeAreaView style={GStyles.container}>
        <View style={styles.container}>
          <Animated.View style={topAnimatedStyle}>
            <TouchableOpacity
              onPress={this.onPressProfile}
              disabled={global.me.isGuest}
              style={{ ...GStyles.centerAlign }}
            >
              <Avatar image={avatarImage} size={106} />
              <Text
                style={[GStyles.textSmall, { color: 'black', marginTop: 16 }]}
              >
                {user.username}
              </Text>
              {!global.me.isGuest && (
                <Text
                  style={[
                    GStyles.regularText,
                    { fontSize: 13, color: GStyle.linkColor, marginTop: 16 },
                  ]}
                >
                  Edit profile
                </Text>
              )}
            </TouchableOpacity>
            {!global.me.isGuest && (
              <View style={styles.detailContainer}>
                <View>
                  <Text style={GStyles.regularText}>10.1k</Text>
                  <Text style={GStyles.elementLabel}>Views</Text>
                </View>
                <View>
                  <Text style={GStyles.regularText}>10.1k</Text>
                  <Text style={GStyles.elementLabel}>Views</Text>
                </View>
                <View>
                  <Text style={GStyles.regularText}>10.1k</Text>
                  <Text style={GStyles.elementLabel}>Views</Text>
                </View>
                <View>
                  <Text style={GStyles.regularText}>10.1k</Text>
                  <Text style={GStyles.elementLabel}>Views</Text>
                </View>
              </View>
            )}
          </Animated.View>
          <Animated.ScrollView
            contentContainerStyle={[
              styles.scrollViewContainer,
              user.isGuest && { paddingTop: 270 },
            ]}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: { y: this.scrollAnimatedValue },
                  },
                },
              ],
              { useNativeDriver: true },
            )}
          >
            <View style={styles.menuContainer}>
              {getMenuItems(navigation).map((menu, index) => (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={menu.onPress}
                  key={index.toString()}
                >
                  <Image source={menu.icon} style={styles.menuIcon} />

                  <View style={styles.menuRight}>
                    <Text style={GStyles.regularText}>{menu.title}</Text>
                    <Image
                      source={ic_chevron_right}
                      style={styles.chevronRight}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  buttonFill: {
    width: '70%',
    height: 40,
    justifyContent: 'center',
    backgroundColor: GStyle.activeColor,
    borderRadius: 12,
  },
  topContainer: {
    width: '100%',
    position: 'absolute',
    height: 280,
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 10,
    borderBottomWidth: 0.2,
    borderBottomColor: 'rgba(0, 0, 0, 0.5)',
  },
  textFill: {
    fontFamily: 'GothamPro-Medium',
    fontSize: 13,
    textAlign: 'center',
    color: 'white',
  },
  detailContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  scrollViewContainer: {
    paddingTop: 300,
    paddingBottom: 120,
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
    marginLeft: 24,
    borderBottomColor: '#C4C4C4',
    borderBottomWidth: 0.4,
  },
  menuIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  chevronRight: {
    width: 5.5,
    height: 9.62,
  },
});

const TProfileMainScreen = (props) => {
  let navigation = useNavigation();
  let route = useRoute();
  return <ProfileMainScreen {...props} navigation={navigation} route={route} />;
};

export default connect(
  (state) => ({
    user: state.me.user,
  }),
  { setMyUserAction },
)(TProfileMainScreen);
