import React from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity } from 'react-native';
import { LIVE_STATUS } from '../../utils/LiveStream/Constants';
import styles from './styles';

const LiveStreamActionButton = ({ currentLiveStatus, onPress }) => {
  let backgroundColor = '#9b59b6';
  let text = 'Start';
  if (Number(currentLiveStatus) === Number(LIVE_STATUS.ON_LIVE)) {
    backgroundColor = '#e74c3c';
    text = 'Stop';
  }
  return (
    <TouchableOpacity onPress={onPress} style={[styles.btnBeginLiveStream, { backgroundColor }]}>
      <Text style={styles.beginLiveStreamText}>{text}</Text>
    </TouchableOpacity>
  );
};

LiveStreamActionButton.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func,
  }),
  currentLiveStatus: PropTypes.number,
  onPress: PropTypes.func,
};

LiveStreamActionButton.defaultProps = {
  navigation: {
    goBack: () => null,
  },
  currentLiveStatus: LIVE_STATUS.PREPARE,
  onPress: () => null,
};

export default LiveStreamActionButton;
