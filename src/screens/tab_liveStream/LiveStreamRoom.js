import React from 'react';
import { Image, Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import stream_thumbnail from '../../assets/images/stream_thumbnail.png';
import ic_speaker from '../../assets/images/Icons/ic_speaker.png';
import ic_eye from '../../assets/images/Icons/ic_eye.png';
import ic_group from '../../assets/images/Icons/ic_group.png';
import get from 'lodash/get';
import { Helper, GStyle } from '../../utils/Global';
import { GStyles } from '../../utils/Global/Styles';

const WINDOW_WIDTH = Helper.getWindowWidth();
const ITEM_WIDTH = (WINDOW_WIDTH - 16 - 8) / 2;
const LiveStreamRoom = (props) => {
  const { room, index } = props;
  const streamer = room?.user;
  const navigation = useNavigation();
  const onPress = () => {
    navigation.navigate('view_live', { room });
  };

  const image = room.thumbnail ? { uri: room.thumbnail } : stream_thumbnail;

  return (
    <TouchableOpacity
      style={[styles.card, index % 2 === 0 && { marginRight: 8 }]}
      onPress={onPress}
    >
      <Image source={image} resizeMode="cover" style={styles.thumbnail} />
      <View style={styles.infoWrapper}>
        <View style={styles.top}>
          <View style={[styles.row, styles.multiGuest]}>
            <Image source={ic_group} style={styles.icons} />
            <Text style={styles.viewersCount}>Multi-Guests</Text>
          </View>
          <View style={styles.row}>
            <Image
              source={ic_eye}
              style={[styles.icons, { tintColor: 'white' }]}
            />
            <Text style={styles.viewersCount}>237</Text>
          </View>
        </View>
        <View style={styles.bottom}>
          <View style={styles.row}>
            <Image source={ic_speaker} style={styles.icons} />
            <Text style={GStyles.textSmall}>{room?.roomName}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: ITEM_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GStyle.primaryColor,
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
  roomName: {
    fontWeight: '600',
    fontSize: 22,
  },
  infoWrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'space-between',
    padding: 6,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottom: {
    flexDirection: 'row',
  },
  viewersCount: {
    fontFamily: 'GothamPro',
    fontWeight: '500',
    fontSize: 11,
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icons: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  multiGuest: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
  },
});

export default LiveStreamRoom;
