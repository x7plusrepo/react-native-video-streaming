import React from 'react';
import {Alert, BackHandler, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {TextField} from '../../lib/MaterialTextField/index';

import {Constants, Global, GStyle, GStyles, Helper, RestAPI} from '../../utils/Global';

import GHeaderBar from '../../components/GHeaderBar';
import {connect} from 'react-redux';
import {setMyUserAction} from '../../redux/me/actions';
import ChatStreamSocketManager from '../../utils/Message/SocketManager';
import CachedImage from '../../components/CachedImage';

const image_logo = require('../../assets/images/Icons/ic_logo.png');
const image_google = require('../../assets/images/Icons/ic_google.png');
const image_facebook = require('../../assets/images/Icons/ic_facebook.png');
const image_twitter = require('../../assets/images/Icons/ic_twitter.png');

class SigninScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('SigninScreen start');

    this.init();
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBack,
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBack);
  }

  init = () => {
    this.state = {
      secureTextEntry: !global.debug,
      phoneNumber: '',
      password: '',
    };

    this.initRef();
  };

  initRef = () => {
    this.phoneNumberRef = (ref) => {
      this.phoneNumber = ref;
    };
    this.passwordRef = (ref) => {
      this.password = ref;
    };
  };

  onFocus = () => {
    let { errors = {} } = this.state;

    for (let name in errors) {
      let ref = this[name];

      if (ref && ref.isFocused()) {
        delete errors[name];
      }
    }

    this.setState({ errors });
  };

  onChangeText = (text) => {
    ['phoneNumber', 'password']
      .map((name) => ({ name, ref: this[name] }))
      .forEach(({ name, ref }) => {
        if (ref.isFocused()) {
          this.setState({ [name]: text });
        }
      });
  };

  onSubmitPhoneNumber = () => {
    this.password.focus();
  };

  onSubmitPassword = () => {
    this.password.blur();
  };

  onAccessoryPress = () => {
    this.setState(({ secureTextEntry }) => ({
      secureTextEntry: !secureTextEntry,
    }));
  };

  renderPasswordAccessory = () => {
    let { secureTextEntry } = this.state;

    let name = secureTextEntry ? 'visibility' : 'visibility-off';

    return (
      <MaterialIcon
        size={24}
        name={name}
        color={TextField.defaultProps.baseColor}
        onPress={this.onAccessoryPress}
        suppressHighlighting={true}
      />
    );
  };

  onForgetPassword = () => {
    this.props.navigation.navigate('fc_forget_password');
  };

  onBack = () => {
    this.props.navigation.goBack();
  };

  onSubmit = async () => {
    let { errors = {} } = this.state;

    ['phoneNumber', 'password'].forEach((name) => {
      let value = this[name].value();

      if (!value) {
        errors[name] = 'Should not be empty';
      } else {
        if ('phoneNumber' === name) {
          const isValidPhoneNumber = Helper.validatePhoneNumber(value);
          if (!isValidPhoneNumber) {
            errors[name] = 'Phone Number is invalid';
          }
        } else if ('password' === name && value.length !== 4) {
          errors[name] = 'Should be 4 digits';
        }
      }
    });

    this.setState({ errors });

    const errorCount = Object.keys(errors).length;
    if (errorCount < 1) {
      const { phoneNumber, password } = this.state;

      let params = {
        phone: phoneNumber,
        password: password,
      };
      global.showForcePageLoader(true);
      RestAPI.login(params, (json, err) => {
        global.showForcePageLoader(false);

        if (err !== null) {
          Helper.alertNetworkError(err?.message);
        } else {
          if (json.status === 200) {
            ChatStreamSocketManager.instance.emitLeaveRoom({
              roomId: global.me?.id,
              userId: global.me?.id,
            });
            const user = json.data?.user || {};
            global.me = user;
            ChatStreamSocketManager.instance.emitJoinRoom({
              roomId: user?.id,
              userId: user?.id,
            });
            this.props.setMyUserAction(global.me);
            Helper.setLocalValue(Constants.KEY_USERNAME, user?.username);
            Helper.setLocalValue(Constants.KEY_PASSWORD, password);
            Helper.setLocalValue(Constants.KEY_USER, JSON.stringify(global.me));

            Global.registerPushToken();

            this.props.navigation.navigate('main_tab_navigator');
          } else {
            Alert.alert(Constants.ERROR_TITLE, json.error);
          }
        }
      });
    }
  };

  onSignup = () => {
    this.props.navigation.navigate('signup');
  };

  render() {
    return (
      <>
        <SafeAreaView style={GStyles.statusBar} />
        <SafeAreaView style={GStyles.container}>
          {this._renderHeader()}
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={GStyles.elementContainer}
          >
            {this._renderTitle()}
            {this._renderInput()}
            {this._renderButton()}
            {this.___renderBottom()}
          </KeyboardAwareScrollView>
          {/* {this._renderBottom()} */}
        </SafeAreaView>
      </>
    );
  }

  _renderHeader = () => {
    return (
      <GHeaderBar
        headerTitle=""
        leftType="back"
        onPressLeftButton={this.onBack}
      />
    );
  };

  _renderTitle = () => {
    return (
      <>
        <CachedImage
          source={image_logo}
          style={[GStyles.image, { width: 54, marginTop: 40 }]}
          resizeMode="contain"
        />
        <Text style={[GStyles.titleText, { fontSize: 30, lineHeight: 36 }]}>
          Welcome back!
        </Text>
        <Text style={{ ...GStyles.titleDescription, marginTop: 20 }}>
          Login to manage your account
        </Text>
      </>
    );
  };

  _renderInput = () => {
    let { phoneNumber, password, errors = {}, secureTextEntry } = this.state;

    return (
      <>
        <TextField
          ref={this.phoneNumberRef}
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          onSubmitEditing={this.onSubmitPhoneNumber}
          returnKeyType="next"
          label="Phone Number"
          value={phoneNumber}
          error={errors.phoneNumber}
          containerStyle={{ marginTop: 24 }}
        />
        <TextField
          ref={this.passwordRef}
          keyboardType="number-pad"
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          //clearTextOnFocus={true}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          onSubmitEditing={this.onSubmitPassword}
          returnKeyType="done"
          label="Password"
          value={password}
          error={errors.password}
          renderRightAccessory={this.renderPasswordAccessory}
          maxLength={4}
          containerStyle={{ marginTop: 8 }}
        />
      </>
    );
  };

  _renderButton = () => {
    return (
      <View style={{ marginVertical: 50 }}>
        <TouchableOpacity onPress={this.onSubmit}>
          <View style={GStyles.buttonFill}>
            <Text style={GStyles.textFill}>Log In</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  ___renderSocial = () => {
    return (
      <View style={{ marginTop: 32 }}>
        <Text
          style={[
            GStyles.regularText,
            { fontSize: 14, color: GStyle.grayColor, marginVertical: 10 },
          ]}
        >
          Or Sign in with
        </Text>
        <View style={[GStyles.rowContainer, { marginTop: 20 }]}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Google Login is clicked.');
            }}
          >
            <CachedImage
              source={image_google}
              style={[GStyles.image, { width: 45 }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 15 }}
            onPress={() => {
              Alert.alert('Facebook Login is clicked.');
            }}
          >
            <CachedImage
              source={image_facebook}
              style={[GStyles.image, { width: 45 }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 15 }}
            onPress={() => {
              Alert.alert('Twitter Login is clicked.');
            }}
          >
            <CachedImage
              source={image_twitter}
              style={[GStyles.image, { width: 45 }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  ___renderBottom = () => {
    return (
      <View style={[GStyles.rowContainer, { marginBottom: 10 }]}>
        <Text
          style={{
            fontFamily: 'GothamPro',
            color: GStyle.grayColor,
            fontSize: 13,
          }}
        >
          Don`t have an account?
        </Text>
        <TouchableOpacity onPress={this.onSignup}>
          <Text
            style={{
              fontFamily: 'GothamPro',
              fontSize: 13,
              color: GStyle.linkColor,
              paddingLeft: 5,
            }}
          >
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
}

const styles = StyleSheet.create({});

export default connect(
  (state) => ({
    user: state.me.user,
  }),
  { setMyUserAction },
)(SigninScreen);
