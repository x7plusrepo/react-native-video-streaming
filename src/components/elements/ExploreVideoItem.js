import React, {Component} from 'react';
import {
  Alert,
  BackHandler,
  Button,
  Dimensions,
  FlatList,
  Image,
  LayoutAnimation,
  ListView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import FastImage from 'react-native-fast-image';
import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
  RestAPI,
} from '../../utils/Global/index';

const WINDOW_HEIGHT = Helper.getWindowHeight();
const WINDOW_WIDTH = Helper.getWindowWidth();

const ExploreVideoItem = ({item, onPress}) => {
  const newTagList = item.tag_list.split(',').join(' ');

  return (
    <View
      style={{
        flex: 1,
        maxWidth: '50%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: GStyle.grayBackColor,
        marginVertical: 8,
        marginHorizontal: 1,
      }}>
      <TouchableOpacity
        onPress={() => {
          onPress(item.id);
        }}
        style={{...GStyles.centerAlign, width: '100%'}}>
        <FastImage
          source={{uri: item.thumb, priority: FastImage.priority.normal}}
          resizeMode={FastImage.resizeMode.contain}
          style={{
            width: '100%',
            height: WINDOW_WIDTH * 0.7,
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
          }}>
          <Text
            style={{
              ...GStyles.regularText,
              color: 'black',
              backgroundColor: item.sticker > 0 ? 'white' : 'transparent',
              marginLeft: 8,
              padding: 2,
            }}>
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
          }}>
          <FontAwesome name="group" style={{fontSize: 18, color: 'black'}} />
          <Text
            style={{
              ...GStyles.regularText,
              color: 'black',
              marginLeft: 8,
            }}>
            {item.view_count}
          </Text>
        </View>
      </TouchableOpacity>
      {newTagList.length > 0 && (
        <Text
          numberOfLines={1}
          style={{...GStyles.regularText, fontSize: 13, marginTop: 4}}>
          {newTagList}
        </Text>
      )}
      <Text style={{...GStyles.regularText, marginTop: 2}}>
        {item.user_name}
      </Text>
      <Text style={{...GStyles.regularText, color: 'green'}}>
        ৳{item.price}
      </Text>
    </View>
  );
};

export default ExploreVideoItem;
