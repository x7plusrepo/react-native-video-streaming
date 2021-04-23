import React from 'react';
import PropTypes from 'prop-types';
import { Text, View, Image } from 'react-native';
import styles from './styles';
import avatars from '../../assets/avatars';
const randomNumber = Math.floor(Math.random() * avatars.length);
const randomImageUrl = avatars[randomNumber];

const MessageItem = (props ) => {
  const { message } = props;
  const { sender } = message;
    console.log(message)
  const avatarImage = sender?.photo ?? randomImageUrl;

  return (
    <View style={styles.chatItem}>
      <View>
        <Image source={{ uri: avatarImage }} style={styles.avatar} />
      </View>
      <View style={styles.messageItem}>
        <Text style={styles.name}>{sender?.username}</Text>
        <Text style={styles.content}>{message?.message}</Text>
      </View>
    </View>
  );
};

MessageItem.propTypes = {
  data: PropTypes.shape({
    userName: PropTypes.string,
    message: PropTypes.string,
  }),
};
MessageItem.defaultProps = {
  data: {
    userName: '',
    message: '',
  },
};

export default MessageItem;
