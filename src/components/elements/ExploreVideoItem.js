import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import FastImage from 'react-native-fast-image';
import { GStyle, GStyles, Constants, Helper } from '../../utils/Global';
import ic_eye from '../../assets/images/Icons/ic_eye.png';
import ic_diamond from '../../assets/images/Icons/ic_diamond.png';

const WINDOW_WIDTH = Helper.getWindowWidth();
const ITEM_WIDTH = (WINDOW_WIDTH - 24 - 12) / 2;

const ExploreVideoItem = ({ item, index, onPress, onLongPress }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        onPress && onPress(item);
      }}
      onLongPress={() => {
        onLongPress && onLongPress(item);
      }}
      style={[styles.container, index % 2 === 0 && { marginRight: 0 }]}
    >
      <FastImage
        source={{
          uri: item?.thumb || '',
        }}
        resizeMode={FastImage.resizeMode.cover}
        style={styles.image}
      />
      <View style={styles.infoWrapper}>
        <View style={GStyles.rowBetweenContainer}>
          <View style={{ flex: 1 }} />
          {item.sticker > 0 && (
            <View style={styles.stickerContainer}>
              <Text style={styles.stickerText}>
                {Constants.STICKER_NAME_LIST[item.sticker]}
              </Text>
            </View>
          )}
        </View>
        <View style={{ flex: 1 }} />
        <View style={GStyles.rowBetweenContainer}>
          <View style={GStyles.rowContainer}>
            <Text style={styles.textLabel}>৳ {item?.price || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    ...GStyles.centerAlign,
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
    borderRadius: 8,
    elevation: 12,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowRadius: 6,
    shadowOpacity: 0.3,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  icons: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  infoWrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    padding: 6,
  },
  textLabel: {
    ...GStyles.textSmall,
    color: GStyle.activeColor,
  },
  stickerContainer: {
    ...GStyles.rowContainer,
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 120,
  },
  stickerText: {
    ...GStyles.textExtraSmall,
    color: 'black',
  },
});

export default ExploreVideoItem;
