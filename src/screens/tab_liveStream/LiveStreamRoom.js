import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import get from 'lodash/get';
import { useNavigation } from '@react-navigation/native';

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 15,
  },
  roomName: {
    fontWeight: '600',
    fontSize: 22,
  },
  liveStatus: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
  },
  statusIcon: {
    width: 50,
    height: 50,
  },
  onLiveIcon: {
    width: 100,
    height: 64,
  },
});

const LiveStreamRoom = (props) => {
  const { room } = props;
  const navigation = useNavigation();
  const onPress = () => {
    navigation.navigate('view_live', { room });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.roomName}>Streamer by: {room?.roomName}</Text>
    </TouchableOpacity>
  );
};

export default LiveStreamRoom;
