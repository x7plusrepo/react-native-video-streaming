import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import styles from './styles';

const MessageBox = (props) => {
  const [message, setMessage] = useState('');
  const textInput = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      textInput.current && textInput.current.focus();
    }, 500);
  }, []);

  const onPressSend = () => {
    const { onPressSendMessage } = props;
    onPressSendMessage(message);
    Keyboard.dismiss();
    setMessage('');
  };

  const onChangeMessageText = (text) => setMessage(text);

  return (
    <View style={styles.messageInput}>
      <TextInput
        ref={textInput}
        style={styles.textInput}
        placeholder="Write a comment"
        underlineColorAndroid="transparent"
        onChangeText={onChangeMessageText}
        value={message}
        autoCapitalize="none"
        autoFocus={false}
        showSoftInputOnFocus={true}
        //autoCorrect={false}
        placeholderTextColor="white"
      />
      <TouchableOpacity
        style={styles.wrapIconSend}
        onPress={onPressSend}
        activeOpacity={0.6}
      >
        <Image
          source={require('../../../assets/images/Icons/ico_send.png')}
          style={styles.iconSend}
        />
      </TouchableOpacity>
    </View>
  );
};

export default MessageBox;
