import React from 'react';
import {
  Alert,
  Image,
  Linking,
  NativeEventEmitter,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';

import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { launchCamera } from 'react-native-image-picker';

import { TextField } from '../../lib/MaterialTextField/index';
import {
  GStyle,
  GStyles,
  Helper,
  Constants,
  RestAPI,
} from '../../utils/Global/index';
import GHeaderBar from '../../components/GHeaderBar';
import Avatar from '../../components/elements/Avatar';
import VideoUpload from '../../utils/NativeModule/NativePackage';
import avatars from '../../assets/avatars';
import { setMyUserAction } from '../../redux/me/actions';


class ProfileEditScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('ProfileEditScreen start');

    this.init();
  }

  componentDidMount() {
    const eventEmitter = new NativeEventEmitter(VideoUpload);
    this.eventListener = eventEmitter.addListener(
      'EventUploadProgress',
      (event) => {
        console.log(event);
        if (parseInt(event.percent) === 100 && event.url) {
          const curTimeTick = Helper.getTimeStamp();
          const uploadInterval = curTimeTick - this._timeTick;
          this._timeTick = curTimeTick;
          if (uploadInterval > 5000) {
            this.setState({ photo: event.url });
            this.onSubmit();
          }
        } else if (event.percent < 0) {
          showForcePageLoader(false);
          error(Constants.ERROR_TITLE, 'Failed to upload image');
        }
      },
    );
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      this.eventListener.remove(); //Removes the listener
    }
  }

  init = () => {
    console.log(global.me);
    const { user } = this.props;
    this.state = {
      secureTextEntry: !global.debug,
      userName: user.username,
      phoneNumber: user.phone,
      password: '',
      profilePhotoSelSource: null,
      profilePhotoSelPath: '',
      photo: null,
    };
    this._timeTick = 0;

    this.initRef();
  };

  initRef = () => {
    this.userNameRef = (ref) => {
      this.userName = ref;
    };
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
    ['userName', 'phoneNumber', 'password']
      .map((name) => ({ name, ref: this[name] }))
      .forEach(({ name, ref }) => {
        if (ref.isFocused()) {
          this.setState({ [name]: text });
        }
      });
  };

  onSubmitUserName = () => {
    this.phoneNumber.focus();
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

  uploadImageToCloudinary = () => {
    const { profilePhotoSelSource, photo } = this.state;
    if (!profilePhotoSelSource || photo) {
      this.onSubmit();
      return;
    }
    showForcePageLoader(true);

    const data = new FormData();
    data.append('file', profilePhotoSelSource);
    data.append('upload_preset', 'dmljgqvn');
    data.append('cloud_name', 'snaplist');
    fetch('https://api.cloudinary.com/v1_1/snaplist/upload', {
      method: 'post',
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({ photo: data.secure_url });
        this.onSubmit();
      })
      .catch((err) => {
        Alert.alert('An Error Occured While Uploading');
        showForcePageLoader(false);
      });

    // return;
    // const { profilePhotoSelPath, photo } = this.state;
    // if (!profilePhotoSelPath || photo) {
    //   this.onSubmit();
    //   return;
    // }
    //
    // showForcePageLoader(true);
    //
    // if (Platform.OS === 'android') {
    //   VideoUpload.upload(
    //     profilePhotoSelPath,
    //     'images/',
    //     'image',
    //     (photo) => {
    //       this.setState({ photo });
    //       this.onSubmit();
    //     },
    //     (msg) => {
    //       console.log('onError', msg);
    //       showForcePageLoader(false);
    //       error(Constants.ERROR_TITLE, 'Failed to upload image');
    //     },
    //   );
    // } else {
    //   VideoUpload.upload(
    //     profilePhotoSelPath,
    //     'images/',
    //     'image',
    //     (error, respArray) => {},
    //   );
    // }
  };
  onSubmit = () => {
    const { userName, phoneNumber, password, photo } = this.state;

    let errors = {};

    ['userName', 'phoneNumber'].forEach((name) => {
      let value = this[name].value();

      if (!value) {
        errors[name] = 'Should not be empty';
      } else {
        if ('phoneNumber' === name) {
          const isValidPhoneNumber = Helper.validatePhoneNumber(value);
          if (!isValidPhoneNumber) {
            errors[name] = 'Phone Number is invalid';
          }
        }
      }
    });

    if (password.length > 0 && password.length !== 4) {
      errors['password'] = 'Should be 4 digits';
    }

    this.setState({ errors });

    const errorCount = Object.keys(errors).length;
    if (errorCount < 1) {
      const params = {
        user_id: global.me.id,
        username: userName,
        phone: phoneNumber,
        password: password,
        photo,
      };

      showForcePageLoader(true);
      RestAPI.update_profile_with_image(params, (json, err) => {
        showPageLoader(false);

        if (err !== null) {
          error(Constants.ERROR_TITLE, 'Failed to update your profile');
        } else {
          if (json.status === 200) {
            global.me = json.data || {};
            this.props.setMyUserAction(json.data || {});
            success(Constants.SUCCESS_TITLE, 'Success to update your profile');
          } else {
            error(Constants.ERROR_TITLE, 'Failed to update your profile');
          }
        }
      });
    }
  };

  onSignout = async () => {
    global.me = null;
    await Helper.removeLocalValue(Constants.KEY_USERNAME);
    await Helper.removeLocalValue(Constants.KEY_PASSWORD);

    global._prevScreen = 'profile_edit';
    this.props.navigation.navigate('play');
  };

  onPressProfilePhoto = () => {
    launchCamera(
      {
        height: 300,
        width: 300,
        mediaType: 'photo',
        cameraType: 'front',
      },
      (response) => {
        console.log(response);
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.log('ImagePicker Error: ', response.error);
        } else {
          const source = {
            uri: response.uri,
            type: response.type,
            name: response.fileName,
          };
          this.setState({
            profilePhotoSelSource: source,
            profilePhotoSelPath: response.path,
            photo: null,
          });
        }
      },
    );
  };

  onBack = () => {
    this.props.navigation.goBack();
  };

  onTerm = () => {
    const url = 'http://www.stars.limited/terms-and-conditions';
    Linking.openURL(url);
  };

  onPrivacy = () => {
    const url = 'http://www.stars.limited/privacy-policy';
    Linking.openURL(url);
  };

  render() {
    return (
      <>
        <SafeAreaView style={GStyles.container}>
          {this._renderHeader()}
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={GStyles.elementContainer}
          >
            {this._renderAvartar()}
            {this._renderMainInputs()}
            {this._renderButton()}
            {this._renderBottom()}
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </>
    );
  }

  _renderHeader = () => {
    return (
      <GHeaderBar
        headerTitle="Edit Profile"
        leftType="back"
        onPressLeftButton={this.onBack}
      />
    );
  };

  _renderAvartar = () => {
    const { profilePhotoSelSource } = this.state;
    const { user } = this.props;

    const randomNumber = Math.floor(Math.random() * avatars.length);
    const randomImageUrl = avatars[randomNumber];
    const avatarImage = !!profilePhotoSelSource
      ? profilePhotoSelSource
      : {
          uri: user?.photo ?? randomImageUrl,
        };

    return (
      <View style={{ alignItems: 'center', marginTop: 50 }}>
        <TouchableOpacity onPress={this.onPressProfilePhoto}>
          <Avatar image={avatarImage} size={106} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onPressProfilePhoto}>
          <Text
            style={[
              GStyles.regularText,
              { fontSize: 13, color: GStyle.linkColor, marginTop: 16 },
            ]}
          >
            Edit photo
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  _renderMainInputs = () => {
    const {
      errors = {},
      userName,
      phoneNumber,
      password,
      secureTextEntry,
    } = this.state;

    return (
      <View style={{ marginTop: 50 }}>
        <TextField
          ref={this.userNameRef}
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          onSubmitEditing={this.onSubmitUserName}
          returnKeyType="next"
          label="Username"
          value={userName}
          error={errors.userName}
        />
        <TextField
          ref={this.phoneNumberRef}
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          onSubmitEditing={this.onSubmitPhoneNumber}
          returnKeyType="done"
          label="Phone Number"
          value={phoneNumber}
          error={errors.phoneNumber}
          containerStyle={{ marginTop: 8 }}
        />
        <TextField
          ref={this.passwordRef}
          keyboardType="number-pad"
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          clearTextOnFocus={true}
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
      </View>
    );
  };

  _renderButton = () => {
    return (
      <View style={{ ...GStyles.centerAlign }}>
        <View style={{ marginTop: 50 }}>
          <TouchableOpacity onPress={this.uploadImageToCloudinary}>
            <View style={GStyles.buttonFill}>
              <Text style={GStyles.textFill}>Save</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 20, marginBottom: 50 }}>
          <TouchableOpacity onPress={this.onSignout}>
            <View style={styles.buttonFill}>
              <Text style={styles.textFill}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  _renderBottom = () => {
    return (
      <View style={{ height: 50 }}>
        <View style={GStyles.rowCenterContainer}>
          <TouchableOpacity onPress={this.onTerm}>
            <Text
              style={{
                fontFamily: 'GothamPro',
                fontSize: 13,
                lineHeight: 22,
                color: GStyle.linkColor,
                paddingLeft: 5,
              }}
            >
              Term of Service
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: 'GothamPro',
              fontSize: 13,
              lineHeight: 22,
              color: GStyle.grayColor,
              paddingLeft: 5,
            }}
          >
            and
          </Text>
          <TouchableOpacity onPress={this.onPrivacy}>
            <Text
              style={{
                fontFamily: 'GothamPro',
                fontSize: 13,
                lineHeight: 22,
                color: GStyle.linkColor,
                paddingLeft: 5,
              }}
            >
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  buttonFill: {
    ...GStyles.rowCenterContainer,
    width: 137,
    height: 30,
    justifyContent: 'center',
    backgroundColor: GStyle.grayColor,
    borderRadius: 6,
  },

  textFill: {
    fontFamily: 'GothamPro-Medium',
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
  },
});

export default connect(
  (state) => ({
    user: state.me.user,
  }),
  { setMyUserAction },
)(ProfileEditScreen);
