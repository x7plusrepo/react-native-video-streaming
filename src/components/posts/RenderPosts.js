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

import { GStyle, GStyles } from '../../utils/Global';
import Avatar from '../elements/Avatar';
import avatars from '../../assets/avatars';
import Helper from '../../utils/Global/Util';
import CachedImage from '../CachedImage';
import Loading from '../../assets/lottie/floating';
import LottieView from 'lottie-react-native';
import Heart from '../../assets/lottie/heart';

const heart = require('../../assets/images/gifts/heart.png');
const eye = require('../../assets/images/Icons/ic_eye.png');
const ic_comment = require('../../assets/images/Icons/ic_comment.png');
const ic_share = require('../../assets/images/Icons/ic_share.png');

const randomNumber = Math.floor(Math.random() * avatars.length);
const randomImageUrl = avatars[randomNumber];

const VIDEO_HEIGHT = Dimensions.get('window').height;

const RenderPosts = (props) => {
  const [showTexts, setShowTexts] = useState(false);
  const [lastPress, setLastPress] = useState(0);
  const [showHeart, setShowHeart] = useState(false);

  const {
    item,
    state,
    index,
    actions,
    detailStyle,
    onOpenProfileSheet,
  } = props;
  const { isVideoPause } = state;
  const paused = isVideoPause || state.curIndex !== index;
  const user = item.user || {};
  const displayName = user?.userType === 0 ? user?.displayName : user?.username;
  const isLike = !!item.isLiked;

  const onPress = () => {
    const delta = new Date().getTime() - lastPress;

    if (delta < 200) {
      actions.onPressLike(!isLike, item);
      setLastPress(0);
    } else {
      setLastPress(new Date().getTime());
      setShowTexts(!showTexts);
    }
  };

  const onPressComments = () => {
    onOpenProfileSheet && onOpenProfileSheet(item);
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
            /*bufferConfig={{
              minBufferMs: 15000,
              maxBufferMs: 30000,
              bufferForPlaybackMs: 5000,
              bufferForPlaybackAfterRebufferMs: 5000,
            }}*/
            style={styles.video}
          />
          {showHeart && (
            <View style={styles.lottieContainer}>
              <LottieView source={Heart} autoPlay loop style={styles.lottie} />
            </View>
          )}
          <View
            style={[GStyles.playInfoWrapper, detailStyle, styles.detailStyle]}
          >
            <View style={styles.textsContainer}>
              {showTexts && (
                <>
                  {!!item?.title && (
                    <View style={styles.textContainer}>
                      <Text numberOfLines={5} style={styles.title}>
                        {item.title}
                      </Text>
                    </View>
                  )}
                  {!!item?.description && (
                    <View style={[styles.textContainer, { marginTop: 12 }]}>
                      <Text numberOfLines={5} style={styles.description}>
                        {item.description}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>

            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
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
              <TouchableOpacity
                onPress={onPressComments}
                style={GStyles.videoActionButton}
              >
                <CachedImage
                  source={ic_comment}
                  style={GStyles.actionIcons}
                  tintColor={'white'}
                />
              </TouchableOpacity>
              <Text style={GStyles.textSmall}>{item.commentsCount || 0}</Text>

              <TouchableOpacity
                onPress={() => {
                  actions.onPressShare(item);
                }}
                style={GStyles.videoActionButton}
              >
                <CachedImage
                  source={ic_share}
                  style={GStyles.actionIcons}
                  tintColor={'white'}
                />
              </TouchableOpacity>
              <View style={[GStyles.centerAlign, { marginTop: 16 }]}>
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
  detailStyle: {
    flexDirection: 'row',
    ...GStyles.rowBetweenContainer,
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
  title: {
    ...GStyles.elementLabel,
    color: 'white',
  },
  description: {
    ...GStyles.textSmall,
    color: 'white',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    //backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 4,
    borderRadius: 8,
  },
  textsContainer: {
    flex: 1,
    height: '100%',
    marginRight: 12,
    justifyContent: 'flex-end',
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
});

export default RenderPosts;
