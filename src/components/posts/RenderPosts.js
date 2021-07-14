import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import convertToProxyURL from 'react-native-video-cache';
import { useNavigation } from '@react-navigation/native';

import { GStyle, GStyles } from '../../utils/Global';
import Avatar from '../elements/Avatar';
import avatars from '../../assets/avatars';

const heart = require('../../assets/images/gifts/heart.png');
const ic_menu_messages = require('../../assets/images/Icons/ic_menu_messages.png');
const ic_share = require('../../assets/images/Icons/ic_share.png');

const randomNumber = Math.floor(Math.random() * avatars.length);
const randomImageUrl = avatars[randomNumber];

const VIDEO_HEIGHT = Dimensions.get('window').height;

const RenderPosts = (props) => {
  const [showTexts, setShowTexts] = useState(false);
  const navigation = useNavigation();

  const { item, state, index, actions, detailStyle, onOpenProfileSheet } = props;
  const { isVideoPause } = state;
  const paused = isVideoPause || state.curIndex !== index;
  const user = item.user || {};
  const displayName = user?.userType === 0 ? user?.displayName : user?.username;
  const isLike = !!item.isLiked;

  const toggleText = () => {
    setShowTexts(!showTexts);
  };

  const onPressComments = () => {
    onOpenProfileSheet && onOpenProfileSheet(item);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={toggleText}
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
            bufferConfig={{
              minBufferMs: 15000,
              maxBufferMs: 30000,
              bufferForPlaybackMs: 5000,
              bufferForPlaybackAfterRebufferMs: 5000,
            }}
            style={styles.video}
          />
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
                  actions.onPressLike(!isLike, item);
                }}
                style={[GStyles.videoActionButton]}
              >
                <Image
                  source={heart}
                  style={{
                    ...GStyles.actionIcons,
                    tintColor: isLike ? GStyle.primaryColor : 'white',
                  }}
                />
              </TouchableOpacity>
              {/*<Text style={GStyles.textSmall}>{item.likeCount || 0}</Text>*/}
              <TouchableOpacity
                onPress={onPressComments}
                style={GStyles.videoActionButton}
              >
                <Image
                  source={ic_menu_messages}
                  style={{
                    ...GStyles.actionIcons,
                    tintColor: 'white',
                  }}
                  tintColor={'white'}
                />
              </TouchableOpacity>
              {/*<Text style={GStyles.textSmall}>
                {item.comments?.length || 0}
              </Text>*/}

              <TouchableOpacity
                onPress={() => {
                  actions.onPressShare(item);
                }}
                style={GStyles.videoActionButton}
              >
                <Image
                  source={ic_share}
                  style={{
                    ...GStyles.actionIcons,
                    tintColor: 'white',
                  }}
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
});

export default RenderPosts;
