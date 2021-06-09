import React from 'react';
import {
  Animated,
  Image,
  Linking,
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

import {
  Constants,
  GStyle,
  GStyles,
  Helper,
  RestAPI,
} from '../../utils/Global';

import ic_tab_liveStream from '../../assets/images/Icons/ic_tab_liveStream.png';
import ic_chevron_right from '../../assets/images/Icons/ic_chevron_right.png';
import ic_menu_messages from '../../assets/images/Icons/ic_menu_messages.png';
import ic_menu_fans from '../../assets/images/Icons/ic_menu_fans.png';
import ic_menu_drafts from '../../assets/images/Icons/ic_menu_drafts.png';
import ic_stars from '../../assets/images/Icons/ic_stars.png';
import ic_menu_saved_products from '../../assets/images/Icons/ic_menu_saved_products.png';
import ic_my_products from '../../assets/images/Icons/ic_my_products.png';
import ic_support from '../../assets/images/Icons/ic_support.png';
import ic_sign from '../../assets/images/Icons/ic_vip.png';
import ChatStreamSocketManager from '../../utils/Message/SocketManager';

const getMenuItems = (navigation, setMyUserAction) => {
  let menu = [
    {
      icon: ic_tab_liveStream,
      title: 'Start broadcast',
      hideGuest: true,
      onPress: () => {
        navigation.navigate('go_live');
      },
    },
    {
      icon: ic_my_products,
      title: 'My Products',
      hideGuest: true,
      onPress: () => {
        navigation.navigate('my_products');
      },
    },
    {
      icon: ic_menu_saved_products,
      title: 'Liked Products',
      onPress: () => {
        navigation.navigate('saved_products');
      },
    },
    {
      icon: ic_menu_messages,
      title: 'Messages',
      key: 'messages',
      onPress: () => {
        navigation.navigate('message');
      },
    },
    {
      icon: ic_menu_fans,
      title: 'Fans',
      hideGuest: true,
      onPress: () => {
        navigation.navigate('fans_screen');
      },
    },
    {
      icon: ic_stars,
      title: 'Stars I follow',
      onPress: () => {
        navigation.navigate('following_users');
      },
    },
    {
      icon: ic_menu_drafts,
      title: 'Drafts',
      hideGuest: true,
      onPress: () => {
        navigation.navigate('camera_draft');
      },
    },
    {
      icon: ic_support,
      title: '01913379598',
      onPress: () => {
        Linking.openURL(`tel:01913379598`);
      },
    },
  ];

  menu.push(
    global.me?.userType === 0
      ? {
          icon: ic_sign,
          title: 'Sign In',
          onPress: () => {
            global._prevScreen = 'profile_edit';
            navigation.navigate('signin');
          },
        }
      : {
          icon: ic_sign,
          title: 'Sign Out',
          onPress: async () => {
            ChatStreamSocketManager.instance.emitLeaveRoom({
              roomId: global.me?.id,
              userId: global.me?.id,
            });
            global.me = null;
            setMyUserAction(null);
            await Helper.removeLocalValue(Constants.KEY_USERNAME);
            await Helper.removeLocalValue(Constants.KEY_PASSWORD);

            global._prevScreen = 'profile_edit';
            navigation.navigate('play');
          },
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
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  init = () => {
    this.state = {
      allViewCount: 0,
    };
  };

  onRefresh = () => {
    let params = {
      user_id: global.me?.id,
    };
    //showForcePageLoader(true);
    RestAPI.get_user_profile(params, (json, err) => {
      showForcePageLoader(false);
      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 200) {
          const user = json.data || {};
          this.props.setMyUserAction(user);
          global.me.photo = json.data.photo;
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
    const { user, navigation, unreadCount } = this.props;
    const randomNumber = Math.floor(Math.random() * avatars.length);
    const randomImageUrl = avatars[randomNumber];
    const avatarImage = {
      uri: user?.photo ?? randomImageUrl,
    };

    const displayName =
      user?.userType === 0 ? user?.displayName : user?.username;

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
      user?.userType === 0 && { height: 250 },
    ];

    return (
      <SafeAreaView style={GStyles.container}>
        <View style={styles.container}>
          <Animated.View style={topAnimatedStyle}>
            <TouchableOpacity
              onPress={this.onPressProfile}
              //disabled={global.me?.userType === 0}
              style={{ ...GStyles.centerAlign }}
            >
              <Avatar image={avatarImage} size={106} />
              <Text
                style={[
                  GStyles.mediumText,
                  { marginTop: 16, textTransform: 'uppercase' },
                ]}
              >
                {displayName}
              </Text>
              <View style={{ flexShrink: 1, marginTop: 8 }}>
                <Text
                  style={{ ...GStyles.regularText, color: GStyle.grayColor }}
                  ellipsizeMode="tail"
                  numberOfLines={1}
                >
                  ID: {user?.uniqueId}
                </Text>
              </View>
            </TouchableOpacity>
            {global.me?.userType === 1 && (
              <View style={styles.detailContainer}>
                <View style={GStyles.centerAlign}>
                  <Text style={[GStyles.regularText, GStyles.boldText]}>
                    {user?.elixir || 0}
                  </Text>
                  <Text style={GStyles.elementLabel}>Elixir</Text>
                </View>
                <View style={GStyles.centerAlign}>
                  <Text style={[GStyles.regularText, GStyles.boldText]}>
                    {user?.elixirFlame || 0}
                  </Text>
                  <Text style={GStyles.elementLabel}>Elixir Flames</Text>
                </View>
                <View style={GStyles.centerAlign}>
                  <Text style={[GStyles.regularText, GStyles.boldText]}>
                    {user?.diamond || 0}
                  </Text>
                  <Text style={GStyles.elementLabel}>Diamond</Text>
                </View>
                <View style={GStyles.centerAlign}>
                  <Text style={[GStyles.regularText, GStyles.boldText]}>0</Text>
                  <Text style={GStyles.elementLabel}>Fans</Text>
                </View>
              </View>
            )}
          </Animated.View>
          <Animated.ScrollView
            contentContainerStyle={[
              styles.scrollViewContainer,
              user?.userType === 0 && { paddingTop: 270 },
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
              {getMenuItems(navigation, setMyUserAction).map((menu, index) => {
                if (user?.userType === 0 && menu.hideGuest) {
                  return null;
                }
                return (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={menu.onPress}
                    key={index.toString()}
                  >
                    <Image source={menu.icon} style={styles.menuIcon} />
                    <View style={styles.menuRight}>
                      <Text style={GStyles.regularText}>{menu.title}</Text>
                      {unreadCount > 0 && menu.key === 'messages' && (
                        <View style={styles.messageBadgeContainer}>
                          <View style={styles.messageBadgeWrapper}>
                            <Text
                              style={[GStyles.textExtraSmall, GStyles.boldText]}
                            >
                              {unreadCount}
                            </Text>
                          </View>
                        </View>
                      )}

                      <Image
                        source={ic_chevron_right}
                        style={styles.chevronRight}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
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
  messageBadgeContainer: {
    flex: 1,
    ...GStyles.rowEndContainer,
    marginRight: 12,
  },
  messageBadgeWrapper: {
    backgroundColor: 'red',
    borderRadius: 120,
    ...GStyles.centerAlign,
    width: 20,
    height: 20,
  },
});

const TProfileMainScreen = (props) => {
  let navigation = useNavigation();
  let route = useRoute();
  return <ProfileMainScreen {...props} navigation={navigation} route={route} />;
};

export default connect(
  (state) => ({
    user: state.me?.user || {},
    unreadCount: state?.message?.unreadCount || 0,
  }),
  { setMyUserAction },
)(TProfileMainScreen);
