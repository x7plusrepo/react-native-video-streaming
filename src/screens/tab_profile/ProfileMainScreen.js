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
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {connect} from 'react-redux';

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

import {useNavigation, useRoute} from '@react-navigation/native';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import ScrollableTabView, {DefaultTabBar} from 'rn-collapsing-tab-bar';

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

import ProfileMyVideoScreen from './ProfileMyVideoScreen';
import ProfileLikedVideoScreen from './ProfileLikedVideoScreen';

const img_default_avatar = require('../../assets/images/ic_default_avatar.png');

const WINDOW_WIDTH = Helper.getWindowWidth();
const WINDOW_HEIGHT = Helper.getWindowHeight();

class ProfileMainScreen extends React.Component {
  constructor(props) {
    super(props);

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
    this.setState({curMonth});
    const lastMonths = Helper.getLastMonthList();
    this.setState({lastMonths});
  }

  componentWillUnmount() {}

  init = () => {
    this.state = {
      profilePhotoUri: global.me ? global.me.photo : null,
      allViewCount: 0,
      monthViewCountList: [],

      tabOneHeight: WINDOW_HEIGHT,
      tabTwoHeight: WINDOW_HEIGHT,

      itemDatas: [],
      curMonth: '',
      lastMonths: [],
    };
  };

  onRefresh = () => {
    this.setState({profilePhotoUri: global.me ? global.me.photo : null});

    let params = {
      user_id: global.me.id,
    };
    showPageLoader(true);
    RestAPI.get_user_profile(params, (json, err) => {
      showPageLoader(false);

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 1) {
          global.me.photo = json.data.user_photo;
          this.setState({
            profilePhotoUri: json.data.user_photo,
            allViewCount: json.data.all_view_count,
            monthViewCountList: json.data.month_view_count_list,
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

  onPressViewCount = () => {
    const {allViewCount} = this.state;

    if (allViewCount > 0) {
      console.log('--- crn_dev --- allViewCount:', allViewCount);
    }
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
    return (
      <>
        <SafeAreaView style={GStyles.container}>
          {this._renderTabBar()}
        </SafeAreaView>
      </>
    );
  }

  _renderAvartar = () => {
    const {
      profilePhotoUri,
      allViewCount,
      monthViewCountList,
      curMonth,
      lastMonths,
    } = this.state;

    console.log('--- crn_dev --- global.me.isGuest:', global.me.isGuest);

    return (
      <View style={{...GStyles.rowCenterContainer, marginVertical: 20}}>
        <View style={{flex: 1, ...GStyles.centerAlign}}>
          {!global.me.isGuest && (
            <Menu>
              <MenuTrigger disabled={allViewCount > 0 ? false : true}>
                <Text style={{...GStyles.mediumText, fontSize: 13}}>Total</Text>
                <Text style={{...GStyles.mediumText, fontSize: 13}}>
                  {allViewCount}
                </Text>
                <Text
                  style={{...GStyles.mediumText, fontSize: 13, marginTop: 4}}>
                  {curMonth}
                </Text>
                <Text style={{...GStyles.mediumText, fontSize: 13}}>
                  {monthViewCountList[0]}
                </Text>
              </MenuTrigger>
              <MenuOptions>
                <MenuOption>
                  <Text style={{...GStyles.mediumText, fontSize: 13}}>
                    {lastMonths[0]} : {monthViewCountList[1]}
                  </Text>
                </MenuOption>
                <MenuOption>
                  <Text style={{...GStyles.mediumText, fontSize: 13}}>
                    {lastMonths[1]} : {monthViewCountList[2]}
                  </Text>
                </MenuOption>
                <MenuOption>
                  <Text style={{...GStyles.mediumText, fontSize: 13}}>
                    {lastMonths[2]} : {monthViewCountList[3]}
                  </Text>
                </MenuOption>
                <MenuOption>
                  <Text style={{...GStyles.mediumText, fontSize: 13}}>
                    {lastMonths[3]} : {monthViewCountList[4]}
                  </Text>
                </MenuOption>
                <MenuOption>
                  <Text style={{...GStyles.mediumText, fontSize: 13}}>
                    {lastMonths[4]} : {monthViewCountList[5]}
                  </Text>
                </MenuOption>
                <MenuOption>
                  <Text style={{...GStyles.mediumText, fontSize: 13}}>
                    {lastMonths[5]} : {monthViewCountList[6]}
                  </Text>
                </MenuOption>
                <MenuOption>
                  <Text style={{...GStyles.mediumText, fontSize: 13}}>
                    {lastMonths[6]} : {monthViewCountList[7]}
                  </Text>
                </MenuOption>
                <MenuOption>
                  <Text style={{...GStyles.mediumText, fontSize: 13}}>
                    {lastMonths[7]} : {monthViewCountList[8]}
                  </Text>
                </MenuOption>
                <MenuOption>
                  <Text style={{...GStyles.mediumText, fontSize: 13}}>
                    {lastMonths[8]} : {monthViewCountList[9]}
                  </Text>
                </MenuOption>
                <MenuOption>
                  <Text style={{...GStyles.mediumText, fontSize: 13}}>
                    {lastMonths[9]} : {monthViewCountList[10]}
                  </Text>
                </MenuOption>
                <MenuOption>
                  <Text style={{...GStyles.mediumText, fontSize: 13}}>
                    {lastMonths[10]} : {monthViewCountList[11]}
                  </Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          )}
        </View>
        <View style={{flex: 1, alignItems: 'center'}}>
          <TouchableOpacity
            onPress={this.onPressProfile}
            disabled={global.me.isGuest}
            style={{...GStyles.centerAlign}}>
            <Image
              source={img_default_avatar}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 106,
                height: 106,
              }}></Image>
            <Avatar
              image={
                profilePhotoUri ? {uri: profilePhotoUri} : img_default_avatar
              }
              size={106}
              // borderRadius={0}
              // borderWidth={2}
            />
            {global.me.isGuest && (
              <Text
                style={[
                  GStyles.regularText,
                  {fontSize: 13, color: GStyle.linkColor, marginTop: 16},
                ]}>
                {global.me.username}
              </Text>
            )}
            {!global.me.isGuest && (
              <Text
                style={[
                  GStyles.regularText,
                  {fontSize: 13, color: GStyle.linkColor, marginTop: 16},
                ]}>
                Edit profile
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={{flex: 1, ...GStyles.centerAlign}}>
          {global.me.isGuest && (
            <TouchableOpacity
              onPress={this.onPressSignin}
              style={{...styles.buttonFill, height: 30}}>
              <Text style={{...styles.textFill}}>Signin</Text>
            </TouchableOpacity>
          )}
          {!global.me.isGuest && (
            <TouchableOpacity
              onPress={this.onPressCamera}
              style={{...styles.buttonFill, height: 30}}>
              <Text style={{...styles.textFill}}>Camera</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={this.onPressCustomerSupport}
            style={{...styles.buttonFill, marginTop: 8}}>
            <Text style={{...styles.textFill}}>Customer</Text>
            <Text style={{...styles.textFill}}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.onPressDraft}
            style={{...styles.buttonFill, height: 30, marginTop: 8}}>
            <Text style={{...styles.textFill}}>Draft</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  ___measureTabOne = (event) => {
    if (event.nativeEvent.layout.height > WINDOW_HEIGHT) {
      this.setState({
        tabOneHeight: event.nativeEvent.layout.height,
      });
    }
  };

  _renderTabBar = () => {
    const {savedCount, myPostCount} = this.props;
    const tabOneHeight =
      140 * (Math.floor(savedCount / 3) + Math.ceil(savedCount % 3)) + 100;
    const tabTwoHeight =
      140 * (Math.floor(myPostCount / 3) + Math.ceil(myPostCount % 3)) + 100;

    return (
      <ScrollableTabView
        collapsableBar={this._renderAvartar()}
        initialPage={0}
        tabContentHeights={[tabOneHeight, tabTwoHeight]}
        scrollEnabled
        prerenderingSiblingsNumber={Infinity}
        tabBarBackgroundColor={GStyle.snowColor}
        tabBarActiveTextColor={GStyle.activeColor}
        tabBarUnderlineStyle={{backgroundColor: GStyle.activeColor}}
        renderTabBar={() => (
          <DefaultTabBar
            inactiveTextColor={GStyle.fontColor}
            activeTextColor={GStyle.fontColor}
            backgroundColor={GStyle.grayBackColor}
          />
        )}>
        <ProfileLikedVideoScreen
          // onLayoutView={this.measureTabOne}
          tabLabel="Saved"
        />
        <ProfileMyVideoScreen tabLabel="My Posts"></ProfileMyVideoScreen>
      </ScrollableTabView>
    );
  };
}

const styles = StyleSheet.create({
  buttonFill: {
    width: '70%',
    height: 40,
    justifyContent: 'center',
    backgroundColor: GStyle.activeColor,
    borderRadius: 12,
  },

  textFill: {
    fontFamily: 'GothamPro-Medium',
    fontSize: 13,
    textAlign: 'center',
    color: 'white',
  },
});

TProfileMainScreen = function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return <ProfileMainScreen {...props} navigation={navigation} route={route} />;
};

export default connect(
  (state) => ({
    savedCount: state.Me.savedCount,
    myPostCount: state.Me.myPostCount,
  }),
  {},
)(TProfileMainScreen);
