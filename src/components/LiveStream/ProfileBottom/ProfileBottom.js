import React from 'react';
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';

import {StackActions, useNavigation, useRoute,} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';

import Avatar from '../../../components/elements/Avatar';
import Achievements from '../../profile/Achievements';
import PlaceHolder from '../../profile/PlaceHolder';

import {GStyle, GStyles, Helper, RestAPI} from '../../../utils/Global';
import avatars from '../../../assets/avatars';

const ic_plus_1 = require('../../../assets/images/Icons/ic_plus_1.png');
const ic_message = require('../../../assets/images/Icons/ic_menu_messages.png');

const WINDOW_WIDTH = Helper.getWindowWidth();
const CELL_WIDTH = (WINDOW_WIDTH - 32 - 10) / 3.0;

const randomNumber = Math.floor(Math.random() * avatars.length);
const randomImageUrl = avatars[randomNumber];

class ProfileBottom extends React.Component {
  constructor(props) {
    super(props);

    console.log('ProfileOtherScreen start');

    this.init();
  }

  componentDidMount() {
    this.onRefresh();
  }

  init = () => {
    this.state = {
      itemDatas: [],
      opponentUser: null,
      isLoading: false,
    };
  };

  onRefresh = () => {
    if (!global._opponentUser?.id) {
      return;
    }

    let params = {
      me_id: global.me ? global.me?.id : 0,
      user_id: global._opponentUser?.id,
      page_number: 1,
      count_per_page: 20,
    };
    this.setState({ isLoading: true });
    RestAPI.get_user_video_list(params, (json, err) => {
      this.setState({ isLoading: false });
      if (err !== null) {
        Helper.alertNetworkError(err?.message);
      } else {
        if (json.status === 200 && json?.data) {
          if (json?.data?.videoList) {
            this.setState({
              itemDatas: json.data.videoList || [],
            });
          }

          if (json?.data?.user) {
            this.setState({
              opponentUser: json.data.user,
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
    this.props.onCloseProfileSheet && this.props.onCloseProfileSheet();
    const pushAction = StackActions.push('profile_video', null);
    this.props.navigation.dispatch(pushAction);
  };

  onChangeLike = () => {
    let params = {
      user_id: global.me ? global.me?.id : 0,
      other_id: global._opponentUser?.id,
    };
    RestAPI.update_user_like(params, (json, err) => {
      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 200 && json?.data) {
          this.setState({
            opponentUser: json.data,
          });
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onPressChat = () => {
    this.props.navigation.navigate('message_chat', {
      opponentUser: this.state.opponentUser || {},
    });
    this.props.onCloseProfileSheet && this.props.onCloseProfileSheet();
  };

  onBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    const { isLoading, opponentUser } = this.state;

    return (
      <View style={styles.container}>
        {this._renderAvatar()}
        <ScrollView>
          {!isLoading && opponentUser ? (
            <>
              {this._renderDetail()}
              {this._renderVideo()}
              {this._renderBottom()}
            </>
          ) : (
            <PlaceHolder />
          )}
        </ScrollView>
      </View>
    );
  }

  _renderBottom = () => {
    const opponentUser = this.state.opponentUser;
    const isFollowing = opponentUser?.isFollowing;

    return (
      <View style={[GStyles.rowEvenlyContainer, styles.bottom]}>
        {opponentUser && global.me?.id !== opponentUser?.id && (
          <>
            <TouchableOpacity
              style={styles.followButtonWrapper}
              onPress={this.onChangeLike}
            >
              <Image
                source={ic_plus_1}
                style={[styles.buttonIcons, { tintColor: 'white' }]}
                tintColor="white"
              />
              <Text style={[GStyles.regularText, { color: 'white' }]}>
                {isFollowing ? 'Followed' : 'Follow'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chatButtonWrapper}
              onPress={this.onPressChat}
            >
              <Image source={ic_message} style={styles.buttonIcons} />
              <Text
                style={[GStyles.regularText, { color: GStyle.activeColor }]}
              >
                Chat
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  _renderAvatar = () => {
    const { opponentUser } = this.state;
    const avatar = {
      uri: opponentUser?.photo ? opponentUser?.photo : randomImageUrl,
    };

    return (
      <View style={styles.avatar}>
        <View
          style={{
            borderRadius: 120,
            borderWidth: 2,
            borderColor: GStyle.activeColor,
          }}
        >
          <Avatar image={avatar} size={84} />
        </View>
      </View>
    );
  };

  _renderDetail = () => {
    const { opponentUser } = this.state;
    const displayName =
      opponentUser?.userType === 0
        ? opponentUser?.displayName
        : opponentUser?.username;

    return (
      <LinearGradient
        colors={[
          'rgba(27, 242, 221, 0.5)',
          'rgba(27, 242, 221, 0.07)',
          'rgba(27, 242, 221, 0)',
        ]}
        style={styles.gradient}
      >
        <View style={styles.profileDetailWrapper}>
          <Text style={[GStyles.mediumText, { textTransform: 'uppercase' }]}>
            {displayName}
          </Text>
          <View style={{ flexShrink: 1, marginVertical: 12 }}>
            <Text style={styles.textID} ellipsizeMode="tail" numberOfLines={1}>
              ID: {opponentUser?.uniqueId}
            </Text>
          </View>
        </View>
        <Achievements opponentUser={opponentUser} />
      </LinearGradient>
    );
  };

  _renderVideo = () => {
    const { itemDatas } = this.state;

    return (
      <ScrollView style={styles.videosWrapper} horizontal>
        {itemDatas?.map((item, i) => {
          return (
            <View
              key={i}
              style={{
                alignItems: 'center',
                borderRadius: 4,
                marginRight: 12,
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
      </ScrollView>
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  avatar: {
    ...GStyles.centerAlign,
    width: '100%',
    position: 'absolute',
    top: -42,
    marginBottom: 32,
    zIndex: 9999,
  },
  textID: {
    ...GStyles.regularText,
    color: GStyle.grayColor,
  },
  profileDetailWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  videosWrapper: {
    flex: 1,
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 16,
    paddingBottom: 24,
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
  return <ProfileBottom {...props} navigation={navigation} route={route} />;
}
