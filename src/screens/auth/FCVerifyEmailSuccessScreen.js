import React from 'react';
import {
  View,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';

import {GStyle, GStyles, Global, Helper, Constants, RestAPI} from '../../utils/Global';

const image_success = require('../../assets/images/ic_success.png');

class FCVerifyEmailSuccessScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('FCVerifyEmailSuccessScreen start');

    this.state = {
      isVisible: true,
      isReady: false,
      showIndicator: false,
    };
  }

  componentWillUnmount() {}

  componentDidMount() {}

  render() {
    return (
      <SafeAreaView style={GStyles.centerContainer}>
        {this._renderImage()}
        {this._renderMessage()}
        {this._renderButton()}
      </SafeAreaView>
    );
  }

  _renderImage = () => {
    return (
      <Image source={image_success} style={[GStyles.image, {width: 100}]} />
    );
  };

  _renderMessage = () => {
    return (
      <>
        <Text style={GStyles.notifyTitle}>Congratulations!</Text>
        <Text style={GStyles.notifyDescription}>
          You have successfully verified your email address.{'\n'}Now lets setup
          your account.
        </Text>
      </>
    );
  };

  _renderButton = () => {
    return (
      <View style={{marginTop: 40}}>
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate('fc_account_step_first');
          }}>
          <View style={GStyles.buttonFill}>
            <Text style={GStyles.textFill}>Setup my account</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
}

const styles = StyleSheet.create({});

export default FCVerifyEmailSuccessScreen;
