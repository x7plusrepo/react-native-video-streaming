import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Keyboard,
  Platform,
  Text,
  TextInput,
} from 'react-native';
import KeyboardAccessory from 'react-native-sticky-keyboard-accessory';
import styles from './styles';
import { GStyles } from '../../../utils/Global/Styles';

export default class BottomActionsGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
    };
  }

  onPressSend = () => {
    const { message } = this.state;
    const { onPressSend } = this.props;
    onPressSend(message);
    Keyboard.dismiss();
    this.setState({ message: '' });
  };

  onChangeMessageText = (text) => [this.setState({ message: text })];

  renderContent() {
    const { message } = this.state;
    const { mode, isJoined, onPressJoin, onExit } = this.props;
    const joinButtonText = isJoined ? 'Leave' : 'Join';
    const onPressJoinButton = isJoined ? onExit : onPressJoin;

    return (
      <View style={GStyles.rowContainer}>
        <View style={styles.messageInput}>
          <TextInput
            style={styles.textInput}
            placeholder="Write a comment"
            underlineColorAndroid="transparent"
            onChangeText={this.onChangeMessageText}
            value={message}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="white"
          />
          <TouchableOpacity
            style={styles.wrapIconSend}
            onPress={this.onPressSend}
            activeOpacity={0.6}
          >
            <Image
              source={require('../../../assets/images/Icons/ico_send.png')}
              style={styles.iconSend}
            />
          </TouchableOpacity>
        </View>
        {mode === 'viewer' && (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={onPressJoinButton}
          >
            <Image
              source={require('../../../assets/images/Icons/ic_join.png')}
              style={styles.iconAction}
            />
            <Text style={GStyles.textSmall}>{joinButtonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  render() {
    return (
      <View style={{ paddingHorizontal: 16 }}>
        {Platform.OS === 'android' ? (
          this.renderContent()
        ) : (
          <KeyboardAccessory backgroundColor="transparent">
            {this.renderContent()}
          </KeyboardAccessory>
        )}
      </View>
    );
  }
}