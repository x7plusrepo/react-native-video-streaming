import React, { Component } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

import FastImage from 'react-native-fast-image';
import { GStyle, GStyles, Constants } from '../../utils/Global/index';

const ExploreVideoItem = ({ item, onPress }) => {
  const newTagList = item.tagList?.map((tag) => tag.name)?.join(' ');
  const user = item.userId || {};
  return (
    <View
      style={{
        flex: 1,
        maxWidth: '50%',
        alignItems: 'center',
        paddingVertical: 8,
        marginHorizontal: 8,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: GStyle.grayBackColor,
      }}
    >
      <TouchableOpacity
        onPress={() => {
          onPress(item.id);
        }}
        style={{ ...GStyles.centerAlign, width: '100%' }}
      >
        <FastImage
          source={{
            uri: item.thumb || '',
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
          style={{
            width: '100%',
            //height: WINDOW_WIDTH * 0.7,
            aspectRatio: 1,
            marginTop: 2,
          }}
        />
        {/* <Image
          source={{uri: item.thumb}}
          style={{
            width: '100%',
            height: WINDOW_WIDTH * 0.7,
            resizeMode: 'cover',
            marginTop: 2,
          }}
        /> */}
        <View
          style={{
            ...GStyles.rowContainer,
            position: 'absolute',
            left: 8,
            bottom: 20,
          }}
        >
          <Text
            style={{
              ...GStyles.regularText,
              color: 'black',
              backgroundColor: item.sticker > 0 ? 'white' : 'transparent',
              marginLeft: 8,
              padding: 2,
            }}
          >
            {Constants.STICKER_NAME_LIST[Number(item.sticker)]}
          </Text>
        </View>
        <View
          style={{
            ...GStyles.rowContainer,
            position: 'absolute',
            right: 20,
            bottom: 20,
            backgroundColor: 'white',
            paddingVertical: 2,
            paddingHorizontal: 4,
          }}
        >
          <FontAwesome name="group" style={{ fontSize: 18, color: 'black' }} />
          <Text
            style={{
              ...GStyles.regularText,
              color: 'black',
              marginLeft: 8,
            }}
          >
            {item.viewCount || 0}
          </Text>
        </View>
      </TouchableOpacity>
      {newTagList.length > 0 && (
        <Text
          numberOfLines={1}
          style={{ ...GStyles.regularText, fontSize: 13, marginTop: 4 }}
        >
          {newTagList}
        </Text>
      )}
      <Text style={{ ...GStyles.regularText, marginTop: 2 }}>
        {user.username}
      </Text>
      <Text style={{ ...GStyles.regularText, color: 'green' }}>
        ৳{item.price}
      </Text>
    </View>
  );
};

export default ExploreVideoItem;
