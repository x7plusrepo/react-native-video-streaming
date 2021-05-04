import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import styles from './styles';
import { GStyles } from '../../../utils/Global';
import GStyle from '../../../utils/Global/Styles';

import { LIVE_STATUS } from '../../../utils/LiveStream/Constants';

import avatar_decoration from '../../../assets/images/Icons/avatar_decoration.png';
import ic_love from '../../../assets/images/Icons/ic_love-potion.png';
import ic_star from '../../../assets/images/Icons/ic_star.png';
import ic_flame from '../../../assets/images/Icons/ic_flame.png';
import ic_close from '../../../assets/images/Icons/ic_close.png';

import avatars from '../../../assets/avatars';

const randomNumber = Math.floor(Math.random() * avatars.length);
const randomImageUrl = avatars[randomNumber];

class Component extends React.Component {
  constructor(props) {
    super(props);
  }

  onPressClose = () => {
    const { navigation, onPressClose } = this.props;
    if (onPressClose) {
      onPressClose();
    } else {
      navigation.goBack();
    }
  };

  render() {
    const { streamer, liveStatus, mode } = this.props;
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
            <Image source={avatar_decoration} style={styles.decorationImage} />
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
          <TouchableOpacity style={styles.btnClose} onPress={this.onPressClose}>
            <Image
              style={styles.icoClose}
              source={ic_close}
              tintColor="red"
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
    );
  }
}

export default Header = (props) => {
  let navigation = useNavigation();
  return <Component {...props} navigation={navigation} />;
};
