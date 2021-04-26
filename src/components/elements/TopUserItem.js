import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  GStyles,
} from '../../utils/Global/index';
import Avatar from './Avatar';

const ic_favorite = require('../../assets/images/Icons/ic_favorite.png');

const TopUserItem = ({index, item, onPress}) =>{
  console.log(item)
  return (
      <View style={{alignItems: 'center', marginTop: 24}}>
        <TouchableOpacity
            onPress={() => {
              onPress(item);
            }}>
          <View style={{width: '88%', flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{...GStyles.regularText}}>{index + 1}</Text>
            <Avatar
                image={{uri: item.photo}}
                // status={item.opponent_status}
                containerStyle={{marginLeft: 12}}
            />
            <View
                style={{
                  marginLeft: 10,
                  flex: 1,
                }}>
              <Text style={GStyles.regularText}>{item.username}</Text>
            </View>
            <Image
                source={ic_favorite}
                style={{width: 20, height: 20}}
            />
            <Text style={{...GStyles.regularText, marginLeft: 8}}>{item.saveCount}</Text>
          </View>
        </TouchableOpacity>
      </View>
  );
}

export default TopUserItem;
