import React, { Component } from 'react';
import { Image, FlatList, TouchableOpacity, Text, View } from 'react-native';
import styles from './styles';
import { GStyle } from '../../../utils/Global';
import ScrollableTabView, { DefaultTabBar } from 'rn-collapsing-tab-bar';
import HomeVideoScreen from '../../../screens/tab_home/HomeVideoScreen';
import { GStyles } from '../../../utils/Global/Styles';
import diamond from './../../../assets/images/Icons/ic_diamond.png';

const something = [
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
      selectedGift: null,
    };
  }

  onPressSendGift = () => {
    const { onPressSendGift } = this.props;
    const { selectedGift } = this.state;
    selectedGift && onPressSendGift && onPressSendGift(selectedGift);
  };

  setSelectedGift = (selectedGift) => {
    this.setState({ selectedGift });
  };

  _renderItem = ({ item, index }) => {
    const { selectedGift } = this.state;
    return (
      <TouchableOpacity
        style={[
          styles.giftContainer,
          selectedGift?.id === item?.id && {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        ]}
        onPress={() => this.setSelectedGift(item)}
      >
        <Image source={{ uri: item.icon }} style={styles.giftIcon} />
        <Text style={[GStyles.textSmall, { marginVertical: 8 }]}>
          {item.name}
        </Text>
        <View style={GStyles.rowContainer}>
          <Image source={diamond} style={styles.diamondIcon} />
          <Text style={[GStyles.textExtraSmall, { color: GStyle.infoColor }]}>
            {item.diamond || 0}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const gifts = this.props.gifts || [];

    return (
      <View style={styles.container}>
        <FlatList
          onEndReachedThreshold={0.4}
          numColumns={4}
          data={gifts}
          renderItem={this._renderItem}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 60,
          }}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
        <View
          style={[
            GStyles.rowEndContainer,
            { marginTop: 16 }
          ]}
        >
          <TouchableOpacity
            style={styles.sendButton}
            onPress={this.onPressSendGift}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
