import React from 'react';
import {Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {StackActions, useNavigation, useRoute} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';

import {GStyle, GStyles, Helper, RestAPI} from '../../utils/Global';
import GHeaderBar from '../../components/GHeaderBar';
import Avatar from '../../components/elements/Avatar';
import Achievements from '../../components/profile/Achievements';
import PlaceHolder from './PlaceHolder';

import avatars from '../../assets/avatars';
import CachedImage from '../../components/CachedImage';

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
    this.onRefresh();
  }

  init = () => {
    this.state = {
      products: [],
      posts: [],
      opponentUser: null,
      isLoading: false,
    };
  };

  loadProducts = () => {
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
              products: json.data.videoList || [],
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

  loadPosts = () => {
    let params = {
      me_id: global.me ? global.me?.id : 0,
      user_id: global._opponentUser?.id,
      page_number: 1,
      count_per_page: 20,
    };
    this.setState({ isLoading: true });
    RestAPI.get_user_post_list(params, (json, err) => {
      this.setState({ isLoading: false });

      if (err !== null) {
        Helper.alertNetworkError(err?.message);
      } else if (json.status === 200 && json?.data?.postList) {
        this.setState({
          posts: json.data.postList || [],
        });
      } else {
        Helper.alertServerDataError();
      }
    });
  };

  onRefresh = () => {
    if (!global._opponentUser?.id) {
      return;
    }
    this.loadProducts();
    this.loadPosts();
  };

  onPressVideo = (value) => {
    const { products } = this.state;
    global._selIndex = products.findIndex((obj) => obj.id === value);
    global._productsList = products;
    global._prevScreen = 'profile_other';
    const pushAction = StackActions.push('profile_video', null);
    this.props.navigation.dispatch(pushAction);
  };

  onPressPost = (value) => {
    const { posts } = this.state;
    global._selIndex = posts.findIndex((obj) => obj.id === value);
    global._postsList = posts;
    global._prevScreen = 'profile_other';
    const pushAction = StackActions.push('post_detail', null);
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
  };

  onBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    const { isLoading, opponentUser } = this.state;

    return (
      <>
        <SafeAreaView style={GStyles.statusBar} />
        <SafeAreaView style={styles.container}>
          {this._renderHeader()}
          {this._renderAvartar()}
          {!isLoading && opponentUser ? (
            <>
              <ScrollView>
                <Achievements opponentUser={opponentUser} />
                {this._renderVideo()}
                {this._renderPosts()}
              </ScrollView>
              {this._renderBottom()}
            </>
          ) : (
            <PlaceHolder />
          )}
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
    const opponentUser = this.state.opponentUser;
    const isFollowing = opponentUser?.isFollowing;

    return (
      <View style={[GStyles.rowEvenlyContainer, styles.bottom]}>
        {opponentUser && (
          <>
            <TouchableOpacity
              style={styles.followButtonWrapper}
              onPress={this.onChangeLike}
            >
              <CachedImage
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
              <CachedImage source={ic_message} style={styles.buttonIcons} />
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
  _renderAvartar = () => {
    const { opponentUser } = this.state;
    const avatar = {
      uri: opponentUser?.photo ? opponentUser?.photo : randomImageUrl,
    };

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
        <Avatar image={avatar} size={84} />
        {opponentUser && (
          <View style={styles.profileDetailWrapper}>
            <Text style={[GStyles.mediumText, { textTransform: 'uppercase' }]}>
              {displayName}
            </Text>
            <View style={[GStyles.rowCenterContainer]}>
              <View style={{ flexShrink: 1 }}>
                <Text
                  style={styles.textId}
                  ellipsizeMode="tail"
                  numberOfLines={1}
                >
                  ID: {opponentUser?.uniqueId}
                </Text>
              </View>
              <TouchableOpacity style={styles.buttonCopy}>
                <Text style={GStyles.elementLabel}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </LinearGradient>
    );
  };

  _renderVideo = () => {
    const { products } = this.state;

    return (
      <View style={styles.listContainer}>
        <Text style={[GStyles.regularText, GStyles.boldText]}>Products</Text>
        <View style={styles.videosWrapper}>
          {products?.map((item, i) => {
            return (
              <View
                key={i}
                style={[styles.listItem, { marginLeft: i % 3 === 0 ? 0 : 5 }]}
              >
                <TouchableOpacity
                  onPress={() => {
                    this.onPressVideo(item.id);
                  }}
                >
                  <FastImage
                    source={{
                      uri: item.thumb || '',
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                    style={{
                      width: CELL_WIDTH,
                      height: 120,
                      backgroundColor: '#ccc',
                    }}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  _renderPosts = () => {
    const { posts } = this.state;
    console.log(posts);
    return (
      <View style={styles.listContainer}>
        <Text style={[GStyles.regularText, GStyles.boldText]}>Posts</Text>
        <View style={styles.videosWrapper}>
          {posts?.map((item, i) => {
            return (
              <View
                key={i}
                style={[styles.listItem, { marginLeft: i % 3 === 0 ? 0 : 5 }]}
              >
                <TouchableOpacity
                  onPress={() => {
                    this.onPressPost(item.id);
                  }}
                >
                  <FastImage
                    source={{
                      uri: item.thumb || '',
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                    style={{
                      width: CELL_WIDTH,
                      aspectRatio: 1,
                      backgroundColor: '#ccc',
                    }}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
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
    flexDirection: 'row',
  },

  textId: {
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
    flex: 1,
    marginLeft: 12,
    ...GStyles.columnEvenlyContainer,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
    marginTop: 16,
  },
  videosWrapper: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
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
  listItem: {
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
});

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <ProfileOtherScreen {...props} navigation={navigation} route={route} />
  );
}
