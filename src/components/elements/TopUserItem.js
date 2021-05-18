import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GStyles } from '../../utils/Global/index';
import Avatar from './Avatar';
import avatars from '../../assets/avatars';
import GStyle from '../../utils/Global/Styles';
import ic_sparkles from '../../assets/images/Icons/ic_sparkles.png';
const ic_plus_1 = require('../../assets/images/Icons/ic_plus_1.png');
const ic_bean = require('../../assets/images/Icons/ic_bean.png');
const ic_rank_first = require('../../assets/images/Icons/ic_rank_first.png');
const ic_rank_second = require('../../assets/images/Icons/ic_rank_second.png');
const ic_rank_third = require('../../assets/images/Icons/ic_rank_third.png');

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

const TopUserItem = ({ index, item, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        onPress(item);
      }}
    >
      <View style={[GStyles.rowCenterContainer, styles.container]}>
        <View style={{ width: 36, ...GStyles.centerAlign}}>{numberMark(index)}</View>

        <Avatar
          image={{ uri: item.photo || randomImageUrl }}
          containerStyle={{ marginLeft: 16 }}
        />
        <View style={styles.detailWrapper}>
          <View style={GStyles.rowContainer}>
            <Image
              source={ic_sparkles}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
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
            <Image
              source={ic_sparkles}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </View>
          <View style={GStyles.rowContainer}>
            <Image
              source={ic_bean}
              style={{ width: 12, height: 12, marginRight: 12 }}
              resizeMode="contain"
            />
            <Text style={[GStyles.regularText, { color: GStyle.yellowColor }]}>
              123456789
            </Text>
          </View>
        </View>
        <Image
          source={ic_plus_1}
          style={{ width: 20, height: 20 }}
          tintColor={GStyle.activeColor}
        />
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
