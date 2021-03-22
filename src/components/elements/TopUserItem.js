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

import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
  RestAPI,
} from '../../utils/Global/index';
import Avatar from './Avatar';

const ic_favorite = require('../../assets/images/ic_favorite.png');

const TopUserItem = ({index, item, onPress}) => (
  <View style={{alignItems: 'center', marginTop: 24}}>
    <TouchableOpacity
      onPress={() => {
        onPress(item);
      }}>
      <View style={{width: '88%', flexDirection: 'row', alignItems: 'center'}}>
        <Text style={{...GStyles.regularText}}>{index + 1}</Text>
        <Avatar
          image={{uri: item.user_photo}}
          // status={item.opponent_status}
          containerStyle={{marginLeft: 12}}
        />
        <View
          style={{
            marginLeft: 10,
            flex: 1,
          }}>
          <Text style={GStyles.regularText}>{item.user_name}</Text>
        </View>
        <Image
          source={ic_favorite}
          style={{width: 20, height: 20}}
        />
        <Text style={{...GStyles.regularText, marginLeft: 8}}>{item.save_count}</Text>
      </View>
    </TouchableOpacity>
  </View>
);

export default TopUserItem;
