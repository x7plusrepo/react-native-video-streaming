import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import convertToProxyURL from 'react-native-video-cache';
import { Constants, GStyle, GStyles } from '../../utils/Global';
import Avatar from '../elements/Avatar';
import avatars from '../../assets/avatars';
import Helper from '../../utils/Global/Util';
import CachedImage from '../CachedImage';
import LottieView from 'lottie-react-native';
import Heart from '../../assets/lottie/heart';

const heart = require('../../assets/images/gifts/heart.png');
const eye = require('../../assets/images/Icons/ic_eye.png');
const ic_menu_messages = require('../../assets/images/Icons/ic_menu_messages.png');
const ic_share = require('../../assets/images/Icons/ic_share.png');
const ic_support = require('../../assets/images/Icons/ic_support.png');
const ic_diamond = require('../../assets/images/Icons/ic_diamond.png');

const randomNumber = Math.floor(Math.random() * avatars.length);
const randomImageUrl = avatars[randomNumber];

const VIDEO_HEIGHT = Dimensions.get('window').height;
const WIDTH = Dimensions.get('window').width;

const RenderProducts = (props) => {
  const [lastPress, setLastPress] = useState(0);
  const [showHeart, setShowHeart] = useState(false);

  const { item, state, index, actions, detailStyle } = props;
  const { isVideoPause } = state;
  const paused = isVideoPause || state.curIndex !== index;
  const user = item.user || {};
  const displayName = user?.userType === 0 ? user?.displayName : user?.username;
  const isLike = !!item.isLiked;
  const newTagList = item.tagList?.map((tag) => tag.name)?.join(' ');
  const categoryName = item?.category?.title || '';
  const subCategoryName = item?.subCategory?.title || '';

  const onPress = () => {
    const delta = new Date().getTime() - lastPress;

    if (delta < 200) {
      actions.onPressLike(!isLike, item);
      setLastPress(0);
    } else {
      setLastPress(new Date().getTime());
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={onPress}
    >
      {Math.abs(state.curIndex - index) < 3 && (
        <>
          <Video
            source={{ uri: convertToProxyURL(item.url || '') }}
            repeat
            paused={paused}
            playWhenInactive={false}
            playInBackground={false}
            poster={item.thumb}
            resizeMode="contain"
            posterResizeMode="contain"
            // bufferConfig={{
            //   minBufferMs: 15000,
            //   maxBufferMs: 30000,
            //   bufferForPlaybackMs: 5000,
            //   bufferForPlaybackAfterRebufferMs: 5000,
            // }}
            style={styles.video}
          />
          {showHeart && (
            <View style={styles.lottieContainer}>
              <LottieView source={Heart} autoPlay loop style={styles.lottie} />
            </View>
          )}

          <View style={[GStyles.playInfoWrapper, detailStyle]}>
            <View style={styles.actionsContainer}>
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                {item.sticker > 0 && (
                  <View style={GStyles.stickerContainer}>
                    <Text style={GStyles.stickerText}>
                      {Constants.STICKER_NAME_LIST[item.sticker]}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => {
                    if (!isLike) {
                      setShowHeart(true);
                      setTimeout(() => {
                        setShowHeart(false);
                      }, 1000);
                    }
                    actions.onPressLike(!isLike, item);
                  }}
                  style={[GStyles.videoActionButton]}
                >
                  <CachedImage
                    source={heart}
                    style={{
                      ...GStyles.actionIcons,
                      tintColor: isLike ? GStyle.primaryColor : 'white',
                    }}
                    tintColor={isLike ? GStyle.primaryColor : 'white'}
                  />
                </TouchableOpacity>
                <Text style={GStyles.textSmall}>
                  {typeof item.likeCount === 'number' ? item.likeCount : 0}
                </Text>

                {user.id !== global.me?.id && (
                  <TouchableOpacity
                    onPress={() => {
                      actions.onPressMessage(item);
                    }}
                    style={GStyles.videoActionButton}
                  >
                    <CachedImage
                      source={ic_menu_messages}
                      style={GStyles.actionIcons}
                    />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => {
                    actions.onPressShare(item);
                  }}
                  style={GStyles.videoActionButton}
                >
                  <CachedImage source={ic_share} style={GStyles.actionIcons} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={[GStyles.rowBetweenContainer, { marginBottom: 8 }]}>
              <View style={GStyles.rowContainer}>
                <View style={GStyles.playInfoTextWrapper}>
                  <Text style={GStyles.playInfoText}>???{item.price}</Text>
                </View>
                <View style={[GStyles.playInfoTextWrapper, { marginLeft: 10 }]}>
                  <CachedImage
                    source={ic_support}
                    style={{ width: 12, height: 12, marginRight: 4 }}
                  />
                  <Text style={GStyles.playInfoText}>01913379598 </Text>
                </View>
                <View style={[GStyles.playInfoTextWrapper, { marginLeft: 10 }]}>
                  <CachedImage
                    source={ic_diamond}
                    style={{ width: 12, height: 12, marginRight: 4 }}
                  />
                  <Text style={GStyles.playInfoText}>{item.price / 10}</Text>
                </View>
              </View>
            </View>
            <View style={[GStyles.rowBetweenContainer, { marginBottom: 8 }]}>
              <View style={GStyles.playInfoTextWrapper}>
                <Text numberOfLines={3} style={GStyles.playInfoText}>
                  {`${
                    !categoryName && !subCategoryName ? newTagList : ''
                  } ${categoryName} ${subCategoryName}`}
                </Text>
              </View>

              <View style={GStyles.playInfoTextWrapper}>
                <Text style={GStyles.playInfoText}>#{item.number}</Text>
              </View>
            </View>
            <View style={[GStyles.rowBetweenContainer, { marginBottom: 8 }]}>
              {item?.description ? (
                <View style={GStyles.playInfoTextWrapper}>
                  <Text numberOfLines={5} style={GStyles.playInfoText}>
                    {item.description}
                  </Text>
                </View>
              ) : (
                <View />
              )}

              <View style={GStyles.centerAlign}>
                <Avatar
                  image={{
                    uri: user.photo ? user.photo : randomImageUrl,
                  }}
                  size={48}
                  onPress={() => {
                    actions.onPressAvatar(item);
                  }}
                  containerStyle={{ marginBottom: 4 }}
                />
                <Text style={GStyles.textSmall}>{displayName}</Text>
              </View>
            </View>
          </View>
          <View style={styles.viewCount}>
            <CachedImage
              source={eye}
              style={styles.viewCountIcon}
              tintColor="white"
            />
            <Text style={GStyles.textSmall}>{item.viewCount || 0}</Text>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: VIDEO_HEIGHT,
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  actionsContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  viewCount: {
    position: 'absolute',
    flexDirection: 'row',
    ...GStyles.centerContainer,
    right: 16,
    top: 32 + Helper.getStatusBarHeight(),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewCountIcon: {
    width: 16,
    height: 16,
    tintColor: 'white',
    marginRight: 6,
  },
  lottieContainer: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    height: 150,
    alignSelf: 'center',
    position: 'absolute',
  },
});

export default RenderProducts;
