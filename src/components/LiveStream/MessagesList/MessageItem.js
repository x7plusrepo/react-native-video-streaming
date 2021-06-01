import React from 'react';
import PropTypes from 'prop-types';
import { Image, Text, View } from 'react-native';
import styles from './styles';

const MessageItem = (props) => {
  const { message } = props;
  const { sender } = message;

  return (
    <View style={styles.chatItem}>
      <View style={styles.messageItem}>
        <Text style={styles.name}>{sender?.username}</Text>
        <Text style={styles.content}>{message?.message}</Text>
      </View>
      {message?.giftIcon && (
        <Image style={styles.giftIcon} source={{ uri: message.giftIcon }} />
      )}
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
