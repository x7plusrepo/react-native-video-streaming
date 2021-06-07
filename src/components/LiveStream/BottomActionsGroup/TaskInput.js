import React, {useEffect, useRef, useState} from 'react';
import {Keyboard, Platform, Text, TextInput, TouchableOpacity, View,} from 'react-native';

import styles from './styles';
import {GStyles} from '../../../utils/Global/Styles';

const TaskInput = (props) => {
  const [goal, setGoal] = useState(props.goal || 0);
  const textInput = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      textInput.current && textInput.current.focus();
    }, 500);
  }, []);

  const onPressSetGoal = () => {
    const { onPressSetGoal } = props;
    onPressSetGoal && onPressSetGoal(goal);
    Keyboard.dismiss();
    setGoal(1);
  };

  const onChangeMessageText = (value) => setGoal(value);

  return (
    <View
      style={[GStyles.rowContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TextInput
        ref={textInput}
        style={[styles.messageInput, styles.textInput, { marginRight:12 }]}
        placeholder="Set task"
        underlineColorAndroid="transparent"
        onChangeText={onChangeMessageText}
        keyboardType = 'numeric'
        value={goal}
        autoCapitalize="none"
        autoFocus={false}
        showSoftInputOnFocus={true}
        //autoCorrect={false}
        placeholderTextColor="white"
      />
      <TouchableOpacity style={styles.sendButton} onPress={onPressSetGoal}>
        <Text style={styles.sendText}>SET</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TaskInput;
