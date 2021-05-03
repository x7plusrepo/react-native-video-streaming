import React, { Component } from 'react';
import { View, TouchableOpacity, Image, FlatList } from 'react-native';
import styles from './styles';
import { GStyle } from '../../../utils/Global';
import ScrollableTabView, { DefaultTabBar } from 'rn-collapsing-tab-bar';
import HomeVideoScreen from '../../../screens/tab_home/HomeVideoScreen';
import { GStyles } from '../../../utils/Global/Styles';

const gifts = [
  {
    name: 'apple',
    icon: require(`./../../../assets/images/gifts/apple.png`),
  },
  {
    name: 'bird',
    icon: require(`./../../../assets/images/gifts/bird.png`),
  },
  {
    name: 'cake-slice',
    icon: require(`./../../../assets/images/gifts/cake-slice.png`),
  },
  {
    name: 'candle',
    icon: require(`./../../../assets/images/gifts/candle.png`),
  },
  {
    name: 'candy',
    icon: require(`./../../../assets/images/gifts/candy.png`),
  },
  {
    name: 'card',
    icon: require(`./../../../assets/images/gifts/card.png`),
  },
  {
    name: 'clown-fish',
    icon: require(`./../../../assets/images/gifts/clown-fish.png`),
  },
  {
    name: 'coconut-drink',
    icon: require(`./../../../assets/images/gifts/coconut-drink.png`),
  },
  {
    name: 'fish',
    icon: require(`./../../../assets/images/gifts/fish.png`),
  },
  {
    name: 'flame',
    icon: require(`./../../../assets/images/gifts/flame.png`),
  },
  {
    name: 'heart',
    icon: require(`./../../../assets/images/gifts/heart.png`),
  },
  {
    name: 'honey',
    icon: require(`./../../../assets/images/gifts/honey.png`),
  },
  {
    name: 'hummingbird',
    icon: require(`./../../../assets/images/gifts/hummingbird.png`),
  },
  {
    name: 'ice-cream',
    icon: require(`./../../../assets/images/gifts/ice-cream.png`),
  },
  {
    name: 'kite',
    icon: require(`./../../../assets/images/gifts/kite.png`),
  },
  {
    name: 'mango',
    icon: require(`./../../../assets/images/gifts/mango.png`),
  },
  {
    name: 'mushroom',
    icon: require(`./../../../assets/images/gifts/mushroom.png`),
  },
  {
    name: 'parrot',
    icon: require(`./../../../assets/images/gifts/parrot.png`),
  },
  {
    name: 'rose',
    icon: require(`./../../../assets/images/gifts/rose.png`),
  },
  {
    name: 'strawberry',
    icon: require(`./../../../assets/images/gifts/strawberry.png`),
  },
  {
    name: 'sunglasses',
    icon: require(`./../../../assets/images/gifts/sunglasses.png`),
  },
  {
    name: 'tarot',
    icon: require(`./../../../assets/images/gifts/tarot.png`),
  },
  {
    name: 'truffle',
    icon: require(`./../../../assets/images/gifts/truffle.png`),
  },
  {
    name: 'ufo',
    icon: require(`./../../../assets/images/gifts/ufo.png`),
  },
];
export default class Gifts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
    };
  }

  onPressSendGift = () => {
    const { onPressSendGift } = this.props;
    onPressSendGift && onPressSendGift();
  };

  _renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity style={styles.giftContainer}>
        <Image source={item.icon} style={styles.giftIcon} />
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          onEndReachedThreshold={0.4}
          numColumns={6}
          data={gifts}
          renderItem={this._renderItem}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 60,
          }}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ alignItems: 'center', paddingTop: 32 }}
        />
      </View>
    );
  }
}
