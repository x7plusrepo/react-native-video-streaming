import React from 'react';
import {Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';

import {StackActions, useNavigation, useRoute,} from '@react-navigation/native';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import FastImage from 'react-native-fast-image';

import {GStyle, GStyles, Helper, RestAPI,} from '../../utils/Global';
import GHeaderBar from '../../components/GHeaderBar';
import Avatar from '../../components/elements/Avatar';
import LinearGradient from 'react-native-linear-gradient';
import avatars from '../../assets/avatars';

const ic_plus_1 = require('../../assets/images/Icons/ic_plus_1.png');
const ic_message = require('../../assets/images/Icons/ic_menu_messages.png');

const WINDOW_WIDTH = Helper.getWindowWidth();
const CELL_WIDTH = (WINDOW_WIDTH - 32 - 10) / 3.0;

const randomNumber = Math.floor(Math.random() * avatars.length);
const randomImageUrl = avatars[randomNumber];

class ProfileOtherScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('ProfileOtherScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('profile_other'));
      Helper.setLightStatusBar();
      this.onRefresh();
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
  };

  onRefresh = () => {
    let params = {
      me_id: global.me ? global.me.id : 0,
      user_id: global._opponentId,
      page_number: '1',
      count_per_page: '1000',
    };
    //showForcePageLoader(true);
    RestAPI.get_user_video_list(params, (json, err) => {
      showForcePageLoader(false);
      if (err !== null) {
        Helper.alertNetworkError(err?.message);
      } else {
        if (json.status === 200) {
          if (this._isMounted) {
            this.setState({
              itemDatas: json.data.videoList || [],
            });
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onPressVideo = (value) => {
    const { itemDatas } = this.state;
    global._selIndex = itemDatas.findIndex((obj) => obj.id === value);
    global._profileOtherVideoDatas = itemDatas;
    global._prevScreen = 'profile_other';
    const pushAction = StackActions.push('profile_video', null);
    this.props.navigation.dispatch(pushAction);
  };

  onChangeLike = (value) => {
    // console.log('--- crn_dev --- value:', value);
    let params = {
      user_id: global.me ? global.me.id : 0,
      other_id: global._opponentId,
    };
    RestAPI.update_user_like(params, (json, err) => {
      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 200) {
          if (this._isMounted) {
            this.setState({
              likeCount: json.data.likeCount || 0,
              dislikeCount: json.data.dislikeCount || 0,
            });
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    return (
      <>
        <SafeAreaView style={GStyles.statusBar} />
        <SafeAreaView style={styles.container}>
          {this._renderHeader()}
          <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
            {this._renderAvartar()}
            {this._renderVideo()}
          </KeyboardAwareScrollView>
          {this._renderBottom()}
        </SafeAreaView>
      </>
    );
  }

  _renderHeader = () => {
    return (
      <GHeaderBar
        headerTitle="Profile"
        leftType="back"
        onPressLeftButton={this.onBack}
      />
    );
  };

  _renderBottom = () => {
    return (
      <View style={[GStyles.rowEvenlyContainer, styles.bottom]}>
        <TouchableOpacity style={styles.followButtonWrapper}>
          <Image source={ic_plus_1} style={[styles.buttonIcons, {tintColor: 'white'}]} tintColor='white'/>
          <Text style={[GStyles.regularText, { color: 'white'}]}>Follow</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatButtonWrapper}>
          <Image source={ic_message} style={styles.buttonIcons} />
          <Text style={[GStyles.regularText, { color: GStyle.activeColor}]}>Chat</Text>
        </TouchableOpacity>
      </View>
    );
  };
  _renderAvartar = () => {
    const avatar = {
      uri: global._opponentPhoto ? global._opponentPhoto : randomImageUrl,
    };

    return (
      <LinearGradient
        colors={[
          'rgba(27, 242, 221, 0.5)',
          'rgba(27, 242, 221, 0.07)',
          'rgba(27, 242, 221, 0)',
        ]}
        style={styles.gradient}
      >
        <View style={styles.avatar}>
          <Avatar image={avatar} size={84} />
          <View style={styles.profileDetailWrapper}>
            <View style={GStyles.rowCenterContainer}>
              <Text style={[GStyles.mediumText, { textTransform: 'uppercase' }]}>
                {global._opponentName}
              </Text>
            </View>
            <View style={[GStyles.rowCenterContainer]}>
              <View style={{ flexShrink: 1 }}>
                <Text
                  style={styles.textID}
                  ellipsizeMode="tail"
                  numberOfLines={1}
                >
                  ID: {global._opponentId}
                </Text>
              </View>
              <TouchableOpacity style={styles.buttonCopy}>
                <Text style={GStyles.elementLabel}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={GStyles.rowEvenlyContainer}>
          <View>
            <Text style={[GStyles.regularText, GStyles.boldText]}>
              10.1k
            </Text>
            <Text style={GStyles.elementLabel}>Views</Text>
          </View>
          <View>
            <Text style={[GStyles.regularText, GStyles.boldText]}>
              10.1k
            </Text>
            <Text style={GStyles.elementLabel}>Views</Text>
          </View>
          <View>
            <Text style={[GStyles.regularText, GStyles.boldText]}>
              10.1k
            </Text>
            <Text style={GStyles.elementLabel}>Views</Text>
          </View>
          <View>
            <Text style={[GStyles.regularText, GStyles.boldText]}>
              10.1k
            </Text>
            <Text style={GStyles.elementLabel}>Views</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  _renderVideo = () => {
    const { itemDatas } = this.state;

    return (
      <View style={styles.videosWrapper}>
        {[
          ...itemDatas,
        ].map((item, i) => {
          return (
            <View
              key={i}
              style={{
                alignItems: 'center',
                borderRadius: 4,
                marginBottom: 4,
                overflow: 'hidden',
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  this.onPressVideo(item.id);
                }}
              >
                <FastImage
                  source={{
                    uri: item.thumb || '',
                    priority: FastImage.priority.normal,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                  style={{
                    width: CELL_WIDTH,
                    height: 120,
                  }}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };
}

const styles = StyleSheet.create({
  bottom: {
    paddingVertical: 16,
  },
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  gradient: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  avatar: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  textID: {
    ...GStyles.regularText,
    color: GStyle.grayColor,
  },
  buttonCopy: {
    ...GStyles.centerAlign,
    padding: 4,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: GStyle.lineColor,
    borderRadius: 4,
    marginLeft: 12,
  },
  profileDetailWrapper: {
    marginLeft: 12,
    ...GStyles.columnEvenlyContainer,
    flex: 1,
  },
  videosWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom:24,
  },
  followButtonWrapper: {
    ...GStyles.rowCenterContainer,
    backgroundColor: GStyle.activeColor,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 120,
  },
  chatButtonWrapper: {
    ...GStyles.rowCenterContainer,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: GStyle.activeColor,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 120,
  },
  buttonIcons: {
    width: 16,
    height: 16,
    marginRight: 12,
  },
});

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <ProfileOtherScreen {...props} navigation={navigation} route={route} />
  );
}