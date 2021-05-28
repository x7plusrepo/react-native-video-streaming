import React, { Component } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  GStyles,
} from '../../utils/Global/index';
import Avatar from './Avatar';
import avatars from "../../assets/avatars";

const randomNumber = Math.floor(Math.random() * avatars.length);
const randomImageUrl = avatars[randomNumber];

const ExploreUserItem = ({ item, onPress }) => (
  <View style={{ alignItems: 'center', marginTop: 24 }}>
    <TouchableOpacity
      onPress={() => {
        onPress(item);
      }}
    >
      <View
        style={{ width: '88%', flexDirection: 'row', alignItems: 'center' }}
      >
        <Avatar
          image={{ uri: item.photo || randomImageUrl }}
          // status={item.opponent_status}
        />
        <View
          style={{
            marginLeft: 10,
            flex: 1,
          }}
        >
          <Text
            style={[
              GStyles.mediumText,
              GStyles.boldText,
              GStyles.upperCaseText,
              { marginHorizontal: 12 },
            ]}
          >
            {item.username}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  </View>
);

export default ExploreUserItem;
