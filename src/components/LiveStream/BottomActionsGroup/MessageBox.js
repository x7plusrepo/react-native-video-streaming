import React, {useEffect, useRef, useState} from 'react';
import {Image, Keyboard, View, Platform, TextInput, TouchableOpacity,} from 'react-native';

import styles from './styles';

const MessageBox = (props) => {
  const [message, setMessage] = useState('');

  const onPressSend = () => {
    const { onPressSendMessage } = props;
    onPressSendMessage(message);
    setMessage('');
  };

  const onChangeMessageText = (text) => setMessage(text);

  return (
    <View
      style={styles.messageInput}
    >
      <TextInput
        style={styles.textInput}
        placeholder="Write a comment"
        underlineColorAndroid="transparent"
        onChangeText={onChangeMessageText}
        onSubmitEditing={onPressSend}
        value={message}
        autoCapitalize="none"
        showSoftInputOnFocus={true}
        autoFocus={false}
        placeholderTextColor="white"
      />
      {/*<TouchableOpacity
        style={styles.wrapIconSend}
        onPress={onPressSend}
        activeOpacity={0.6}
      >
        <Image
          source={require('../../../assets/images/Icons/ico_send.png')}
          style={styles.iconSend}
        />
      </TouchableOpacity>*/}
    </View>
  );
};

export default MessageBox;
