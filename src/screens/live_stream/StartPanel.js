import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from './styles';
import GStyles from '../../utils/Global/Styles';

const StartPanel = ({ onPressStart }) => {
  const [topic, setTopic] = useState('');
  const onPress = () => {
    onPressStart && onPressStart(topic);
    setTopic('');
  };
  const onChangeMessageText = (text) => setTopic(text);

  return (
    <View style={styles.wrapperStartPanel}>
      <TextInput
        style={styles.topicInput}
        placeholder="Pick a topic to chat?"
        underlineColorAndroid="transparent"
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor="white"
        onChangeText={onChangeMessageText}
      />
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.btnBeginLiveStream,
          { backgroundColor: GStyles.primaryColor },
        ]}
      >
        <Text style={styles.beginLiveStreamText}>Start Live Broadcast</Text>
      </TouchableOpacity>
    </View>
  );
};

StartPanel.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func,
  }),
  currentLiveStatus: PropTypes.number,
  onPress: PropTypes.func,
};

export default StartPanel;
