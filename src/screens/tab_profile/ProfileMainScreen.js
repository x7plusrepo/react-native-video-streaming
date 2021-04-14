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

import ic_menu_goLive from '../../assets/images/ic_menu_goLive.png';
import ic_tab_play from '../../assets/images/ic_tab_play.png';
import ic_chevron_right from '../../assets/images/ic_chevron_right.png';
import ic_menu_messages from '../../assets/images/ic_menu_messages.png';
import ic_menu_fans from '../../assets/images/ic_menu_fans.png';
import ic_menu_drafts from '../../assets/images/ic_menu_drafts.png';
import ic_tab_top from '../../assets/images/ic_tab_top.png';
import ic_menu_downloads from '../../assets/images/ic_menu_downloads.png';
import ic_menu_saved_products from '../../assets/images/ic_menu_saved_products.png';

const getMenuItems = () => {
  return [
    {
      icon: ic_menu_goLive,
      title: 'Go Live',
      onPress: () => {},
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
      onPress: () => {},
    },
    {
      icon: ic_tab_top,
      title: 'Top',
      onPress: () => {},
    },
    {
      icon: ic_menu_saved_products,
      title: 'Saved Products',
      onPress: () => {},
    },
  ];
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
    showPageLoader(true);
    RestAPI.get_user_profile(params, (json, err) => {
      showPageLoader(false);
      console.log(err);
      console.log(json);
      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 200) {
          this.props.setMyUserAction(json.data || {});
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

  onPressSignin = () => {
    global._prevScreen = 'profile_edit';
    this.props.navigation.navigate('signin');
  };

  onPressCamera = () => {
    // global._prevScreen = 'profile_edit';
    this.props.navigation.navigate('camera_main');
  };

  onPressCustomerSupport = () => {
    global._roomId = '1';
    global._opponentName = 'Stars';
    this.props.navigation.navigate('message_chat');
  };

  onPressDraft = () => {
    this.props.navigation.navigate('camera_draft');
  };

  render() {
    const { user } = this.props;
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
                style={[GStyles.regularText, { fontSize: 13, marginTop: 16 }]}
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
            contentContainerStyle={styles.scrollViewContainer}
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
              {getMenuItems().map((menu, index) => (
                <TouchableOpacity style={styles.menuItem}>
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
    height: 300,
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
    paddingTop: 330,
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
    savedCount: state.me.savedCount,
    myPostCount: state.me.myPostCount,
    user: state.me.user,
  }),
  { setMyUserAction },
)(TProfileMainScreen);
