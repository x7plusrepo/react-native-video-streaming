import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';

import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, StackActions } from '@react-navigation/native';

import styles from './styles';
import { GStyles } from '../../../utils/Global';
import GStyle from '../../../utils/Global/Styles';

import { LIVE_STATUS } from '../../../utils/LiveStream/Constants';

import avatar_decoration from '../../../assets/images/Icons/avatar_decoration.png';
import ic_love from '../../../assets/images/Icons/ic_love-potion.png';
import ic_bean from '../../../assets/images/Icons/ic_bean.png';
import ic_star from '../../../assets/images/Icons/ic_star.png';
import ic_flame from '../../../assets/images/Icons/ic_flame.png';
import ic_close from '../../../assets/images/Icons/ic_close.png';

import avatars from '../../../assets/avatars';

const randomNumber = Math.floor(Math.random() * avatars.length);
const randomImageUrl = avatars[randomNumber];

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.interval = null;
    this.timer = null;
    this.state = {
      showingRandomProduct: false,
      randomProduct: null,
    };
  }

  componentDidMount(): void {
    this.interval = setInterval(this.onRandomProduct, 10000);
  }

  componentWillUnmount(): void {
    clearInterval(this.interval);
    clearTimeout(this.timer);
  }

  onRandomProduct = () => {
    const { products } = this.props;
    const randomNumber = Math.floor(Math.random() * avatars.length);
    const randomProduct = products[randomNumber];

    this.setState({
      showingRandomProduct: true,
      randomProduct,
    });

    this.timer = setTimeout(this.onHideProduct, 5000);
  };

  onHideProduct = () => {
    this.setState({
      showingRandomProduct: false,
      randomProduct: null,
    });
  };

  onPressClose = () => {
    const { navigation, onPressClose } = this.props;
    if (onPressClose) {
      onPressClose();
    } else {
      navigation.goBack();
    }
  };

  onPressVideo = () => {
    const { randomProduct } = this.state;
    const { products } = this.props;
    global._selIndex = products.findIndex((obj) => obj.id === randomProduct.id);
    global._randomProducts = products;
    global._prevScreen = 'stream_header';
    const pushAction = StackActions.push('profile_video', null);
    this.props.navigation.dispatch(pushAction);
  };

  render() {
    const { streamer, liveStatus, mode } = this.props;
    const { showingRandomProduct, randomProduct } = this.state;
    const streamerName = streamer?.username;
    const avatarImage = { uri: streamer?.photo || randomImageUrl };
    const badgeBackground =
      liveStatus === LIVE_STATUS.ON_LIVE
        ? 'red'
        : liveStatus === LIVE_STATUS.PREPARE
        ? GStyle.primaryColor
        : GStyle.grayColor;
    const badgeText =
      liveStatus === LIVE_STATUS.ON_LIVE
        ? 'Live'
        : liveStatus === LIVE_STATUS.PREPARE
        ? 'Preparing'
        : 'Finished';

    return (
      <View>
        <View style={styles.wrapper}>
          <View styles={styles.infoWrapper}>
            <View style={styles.streamerInfoWrapper}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0)']}
                style={styles.streamerGradient}
              >
                <View style={styles.textWrapper}>
                  <Text style={[GStyles.textExtraSmall]}>{streamerName}</Text>
                  <Text style={GStyles.textExtraSmall}>449</Text>
                </View>
              </LinearGradient>
              <Image source={avatarImage} style={styles.userAvatarImage} />
              <Image
                source={avatar_decoration}
                style={styles.decorationImage}
              />
            </View>
            <View style={styles.streamInfoWrapper}>
              <View style={styles.streamInfo}>
                <View style={styles.infoLabelWrapper}>
                  <Image source={ic_love} style={styles.infoIcon} />
                  <Text style={styles.archiveText}>22, 345</Text>
                </View>
              </View>
              <View style={styles.streamInfo}>
                <View style={styles.infoLabelWrapper}>
                  <Image source={ic_star} style={styles.infoIcon} />
                  <Text style={styles.infoText}>Share</Text>
                </View>
              </View>
              <View style={styles.streamInfo}>
                <View style={styles.infoLabelWrapper}>
                  <Image source={ic_flame} style={styles.infoIcon} />
                  <Text style={styles.infoText}>Share</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={GStyles.centerAlign}>
            <TouchableOpacity
              style={styles.btnClose}
              onPress={this.onPressClose}
            >
              <Image
                style={styles.icoClose}
                source={ic_close}
                tintColor="white"
              />
            </TouchableOpacity>
            {mode !== 'streamer' && (
              <View
                style={[
                  styles.badgeWrapper,
                  { backgroundColor: badgeBackground },
                ]}
              >
                <Text style={styles.badgeText}>{badgeText}</Text>
              </View>
            )}
          </View>
        </View>

        {showingRandomProduct && randomProduct && (
          <TouchableOpacity
            onPress={this.onPressVideo}
            style={{
              marginTop: 24,
              marginLeft: 24,
              overflow: 'hidden',
              borderRadius: 16,
              backgroundColor: 'rgba(16, 33, 75, 0.88)',
              width: 120,
              height: 150,
            }}
          >
            <Image source={{ uri: randomProduct?.thumb }} style={{ width: '100%', height: '100%' }} />
            <View
              style={[GStyles.columnEndContainer, { position: 'absolute', flex: 1, width: '100%', height: '100%', padding: 8 }]}
            >
              {/*<Text style={[GStyles.textSmall, { marginBottom: 4 }]}>*/}
              {/*  0/1200*/}
              {/*</Text>*/}
              <View style={GStyles.rowContainer}>
                <Image source={ic_bean} style={styles.infoIcon} />
                <Text style={styles.archiveText}>{randomProduct?.price || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const Header = (props) => {
  let navigation = useNavigation();
  return <Component {...props} navigation={navigation} />;
};

export default connect(
  (state) => ({
    products: state.products.products,
  }),
  {},
)(Header);
