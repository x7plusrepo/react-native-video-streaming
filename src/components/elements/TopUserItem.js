import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {GStyles} from '../../utils/Global';
import Avatar from './Avatar';
import avatars from '../../assets/avatars';
import GStyle from '../../utils/Global/Styles';

const ic_diamond = require('../../assets/images/Icons/ic_diamond.png');
const ic_rank_first = require('../../assets/images/Icons/ic_rank_first.png');
const ic_rank_second = require('../../assets/images/Icons/ic_rank_second.png');
const ic_rank_third = require('../../assets/images/Icons/ic_rank_third.png');
const ic_elixir = require('../../assets/images/Icons/ic_love-potion.png');

const randomNumber = Math.floor(Math.random() * avatars.length);
const randomImageUrl = avatars[randomNumber];

const numberMark = (index) => {
  if (index > 2) {
    return <Text style={{ ...GStyles.regularText }}>{index + 1}</Text>;
  }
  const icon =
    index === 0 ? ic_rank_first : index === 1 ? ic_rank_second : ic_rank_third;
  return (
    <Image
      source={icon}
      style={{ width: 36, height: 36 }}
      resizeMode="contain"
    />
  );
};

const TopUserItem = ({ index, item, onPress, sortBy = 'elixir' }) => {
  const icon = sortBy === 'elixir' ? ic_elixir : ic_diamond;
  const iconText =
    sortBy === 'elixir' ? item?.elixir || 0 : item?.diamondSpent || 0;

  return (
    <TouchableOpacity
      onPress={() => {
        onPress(item);
      }}
    >
      <View style={[GStyles.rowCenterContainer, styles.container]}>
        <View style={{ width: 36, ...GStyles.centerAlign }}>
          {numberMark(index)}
        </View>

        <Avatar
          image={{ uri: item.photo || randomImageUrl }}
          containerStyle={{ marginLeft: 16 }}
        />
        <View style={styles.detailWrapper}>
          <Text
            style={[
              GStyles.mediumText,
              GStyles.boldText,
              GStyles.upperCaseText,
            ]}
          >
            {item?.username}
          </Text>
          <View style={[GStyles.rowContainer, { marginTop: 2 }]}>
            <Image
              source={icon}
              style={{ width: 16, height: 16, marginRight: 4 }}
              resizeMode="contain"
            />
            <Text style={[GStyles.regularText, { color: GStyle.yellowColor }]}>
              {iconText}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: GStyle.grayColor,
    paddingHorizontal: 16,
  },
  detailWrapper: {
    flex: 1,
    marginLeft: 12,
  },
});

export default TopUserItem;
