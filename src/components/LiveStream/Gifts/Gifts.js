import React, { Component } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import styles from './styles';
import { GStyle } from '../../../utils/Global';
import ScrollableTabView, { DefaultTabBar } from 'rn-collapsing-tab-bar';
import HomeVideoScreen from '../../../screens/tab_home/HomeVideoScreen';
import { GStyles } from '../../../utils/Global/Styles';

export default class Gifts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
    };
  }

  onPressGift = () => {
    const { onPressGift } = this.props;
    onPressGift && onPressGift();
  };

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.onPressGift}>
          <Image
            source={require('../../../assets/images/Icons/ico_heart.png')}
            style={styles.giftIcon}
          />
        </TouchableOpacity>
      </View>
    );
  }
}
