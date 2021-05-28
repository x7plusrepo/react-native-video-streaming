import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import FastImage from 'react-native-fast-image';
import {GStyle, GStyles, Constants, Helper} from '../../utils/Global/index';
import ic_eye from "../../assets/images/Icons/ic_eye.png";
import ic_diamond from "../../assets/images/Icons/ic_diamond.png";

const WINDOW_WIDTH = Helper.getWindowWidth();
const ITEM_WIDTH = (WINDOW_WIDTH - 24 - 12) / 2;

const ExploreVideoItem = ({ item, index, onPress }) => {
  const newTagList = item.tagList?.map((tag) => tag.name)?.join(' ');
  const user = item.userId || {};
  return (
    <TouchableOpacity
      onPress={() => {
        onPress(item.id);
      }}
      style={[styles.container, index % 2 === 0 && { marginRight: 0 }]}
    >
      <FastImage
        source={{
          uri: item.thumb || '',
        }}
        resizeMode={FastImage.resizeMode.cover}
        style={styles.image}
      />
      <View style={styles.infoWrapper}>
        <View style={{ flex: 1 }} />
        <View style={GStyles.rowBetweenContainer}>
          <View style={GStyles.rowContainer}>
            <Image
              source={ic_diamond}
              style={styles.icons}
            />
            <Text style={styles.textLabel}>237</Text>
          </View>
          <View style={GStyles.rowContainer}>
            <Image
              source={ic_eye}
              style={[styles.icons, { tintColor: 'white' }]}
            />
            <Text style={styles.textLabel}>237</Text>
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width : ITEM_WIDTH,
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
    ...GStyles.textExtraSmall,
    color: GStyle.activeColor,
  }
});

export default ExploreVideoItem;
