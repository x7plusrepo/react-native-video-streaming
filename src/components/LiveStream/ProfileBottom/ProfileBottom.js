import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

import { GStyle, GStyles, Helper, RestAPI } from '../../../utils/Global';
import Avatar from '../../../components/elements/Avatar';
import LinearGradient from 'react-native-linear-gradient';
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
    this._isMounted = true;
    this.onRefresh();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  init = () => {
    this.state = {
      itemDatas: [],
      followed: false,
    };
    this._isMounted = false;
  };

  onRefresh = () => {
    this.setState({ opponentUser: global._opponentUser || {} });
    let params = {
      me_id: global.me ? global.me?.id : 0,
      user_id: global._opponentUser?.id,
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
    this.props.onCloseProfileSheet && this.props.onCloseProfileSheet();
    const pushAction = StackActions.push('profile_video', null);
    this.props.navigation.dispatch(pushAction);
  };

  onChangeLike = (value) => {
    this.setState({ followed: true });
    // let params = {
    //   user_id: global.me ? global.me?.id : 0,
    //   other_id: global._opponentUser?.id,
    // };
    // RestAPI.update_user_like(params, (json, err) => {
    //   if (err !== null) {
    //     Helper.alertNetworkError();
    //   } else {
    //     if (json.status === 200) {
    //       if (this._isMounted) {
    //         this.setState({
    //           likeCount: json.data.likeCount || 0,
    //         });
    //       }
    //     } else {
    //       Helper.alertServerDataError();
    //     }
    //   }
    // });
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
    return (
      <View style={styles.container}>
        {this.state.opponentUser?.id && (
          <>
            {this._renderAvatar()}
            {this._renderDetail()}
            {this._renderVideo()}
            {this._renderBottom()}
          </>
        )}
      </View>
    );
  }

  _renderBottom = () => {
    const { followed } = this.state;

    return (
      <View style={[GStyles.rowEvenlyContainer, styles.bottom]}>
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
            {followed ? 'Followed' : 'Follow'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chatButtonWrapper}
          onPress={this.onPressChat}
        >
          <Image source={ic_message} style={styles.buttonIcons} />
          <Text style={[GStyles.regularText, { color: GStyle.activeColor }]}>
            Chat
          </Text>
        </TouchableOpacity>
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
    const lvl = Helper.getLvLGuest(opponentUser?.diamondSpent || 0);

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
            {opponentUser?.username}
          </Text>
          <View style={{ flexShrink: 1, marginTop: 12 }}>
            <Text style={styles.textID} ellipsizeMode="tail" numberOfLines={1}>
              ID: {opponentUser?.id}
            </Text>
          </View>
        </View>

        <View style={GStyles.rowEvenlyContainer}>
          {opponentUser?.userType === 1 ? (
            <>
              <View style={GStyles.centerAlign}>
                <Text style={[GStyles.regularText, GStyles.boldText]}>
                  {opponentUser?.elixir || 0}
                </Text>
                <Text style={GStyles.elementLabel}>Elixir</Text>
              </View>
              <View style={GStyles.centerAlign}>
                <Text style={[GStyles.regularText, GStyles.boldText]}>
                  {opponentUser?.elixirFlame || 0}
                </Text>
                <Text style={GStyles.elementLabel}>Elixir Flames</Text>
              </View>
              <View style={GStyles.centerAlign}>
                <Text style={[GStyles.regularText, GStyles.boldText]}>0</Text>
                <Text style={GStyles.elementLabel}>Fans</Text>
              </View>
            </>
          ) : (
            <>
              <View style={GStyles.centerAlign}>
                <Text style={[GStyles.regularText, GStyles.boldText]}>
                  {opponentUser?.diamond || 0}
                </Text>
                <Text style={GStyles.elementLabel}>Diamonds</Text>
              </View>
              <View style={GStyles.centerAlign}>
                <Text style={[GStyles.regularText, GStyles.boldText]}>
                  {lvl}
                </Text>
                <Text style={GStyles.elementLabel}>LvL</Text>
              </View>
            </>
          )}
        </View>
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
    paddingBottom: 24,
    paddingTop: 36,
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