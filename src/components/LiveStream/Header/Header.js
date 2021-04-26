import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import styles from './styles';
import { GStyles } from '../../../utils/Global';

class Component extends React.Component {
  constructor(props) {
    super(props);
  }

  onPressClose = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  render() {
    return (
      <View style={styles.wrapper}>
        <View styles={styles.infoWrapper}>
          <View style={styles.streamerInfoWrapper}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0)']}
              style={styles.streamerGradient}
            >
              <View style={styles.textWrapper}>
                <Text style={[GStyles.textExtraSmall]}>Ai ZhenZhong</Text>
                <Text style={GStyles.textExtraSmall}>449</Text>
              </View>
            </LinearGradient>
            <Image
              source={require('../../../assets/images/Icons/ic_star.png')}
              style={styles.userAvatarImage}
            />
            <Image
              source={require('../../../assets/images/Icons/avatar-decoration.png')}
              style={styles.decorationImage}
            />
          </View>
          <View style={styles.streamInfoWrapper}>
            <View style={styles.streamInfo}>
              <View style={styles.infoLabelWrapper}>
                <Image
                  source={require('../../../assets/images/Icons/ic_bean.png')}
                  style={styles.infoIcon}
                />
                <Text style={styles.archiveText}>22, 345</Text>
              </View>
            </View>
            <View style={styles.streamInfo}>
              <View style={styles.infoLabelWrapper}>
                <Image
                  source={require('../../../assets/images/Icons/ic_star.png')}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>Share</Text>
              </View>
            </View>
            <View style={styles.streamInfo}>
              <View style={styles.infoLabelWrapper}>
                <Image
                  source={require('../../../assets/images/Icons/ic_tab_play.png')}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>Share</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.btnClose} onPress={this.onPressClose}>
          <Image
            style={styles.icoClose}
            source={require('../../../assets/images/Icons/ic_close.png')}
            tintColor="white"
          />
        </TouchableOpacity>
      </View>
    );
  }
}

export default Header = (props) => {
  let navigation = useNavigation();
  return <Component {...props} navigation={navigation} />;
};
