import React from 'react';
import {
  BackHandler,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view';
import ProgressBar from '../../lib/Progress/Bar';
import { Button, Dialog, Paragraph, Portal } from 'react-native-paper';
import { createThumbnail } from 'react-native-create-thumbnail';
import RNFS from 'react-native-fs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import GHeaderBar from '../../components/GHeaderBar';
import { TextField } from '../../lib/MaterialTextField/index';
import {
  Constants,
  Global,
  GStyle,
  GStyles,
  Helper,
  RestAPI,
} from '../../utils/Global';

const WINDOW_WIDTH = Helper.getWindowWidth();

class PostUploadScreen extends React.Component {
  constructor(props) {
    super(props);
    console.log('PostUploadScreen start');

    this.init();
  }

  componentDidMount() {
    this.onRefresh();

    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBack,
    );
  }

  componentWillUnmount() {
    this.backHandler?.remove();
  }

  init = () => {
    this.state = {
      isVisibleProgress: false,
      isVisibleDialog: false,
      percent: 0,
      text: '',
      description: '',
    };

    this.initRef();
  };

  onRefresh = () => {
    if (global._prevScreen !== 'camera_preview') {
      showForcePageLoader(true);
      createThumbnail({ url: global._videoUri })
        .then((response) => {
          global._thumbUri = response.path;
          showForcePageLoader(false);
        })
        .catch((err) => {
          console.log({ err });
          showForcePageLoader(false);
          global._thumbUri = null;
          error(Constants.ERROR_TITLE, 'Failed to create thumbnail');
        });
    }
  };

  initRef = () => {
    this.titleRef = (ref) => {
      this.title = ref;
    };
    this.descriptionRef = (ref) => {
      this.description = ref;
    };
  };

  uploadPostToBackend = () => {
    const { title, description, uploadedThumbUrl, uploadedVideoUrl } =
      this.state;

    if (!uploadedThumbUrl || !uploadedVideoUrl) {
      alert('Resource not found.');
    }

    showForcePageLoader(true);
    const params = {
      userId: global.me?.id,
      url: uploadedVideoUrl,
      thumb: uploadedThumbUrl,
      title,
      description: description,
    };

    RestAPI.add_post(params, async (json, err) => {
      showForcePageLoader(false);
      if (err !== null) {
        error(Constants.ERROR_TITLE, 'Failed to post');
      } else {
        if (json.status === 201) {
          success(Constants.SUCCESS_TITLE, 'Success to post');
          await this.deleteVideo();
        } else {
          error(Constants.ERROR_TITLE, 'Failed to post');
        }
      }
      this.props.navigation.goBack();
    });
  };

  deleteVideo = async () => {
    RNFS.unlink(global._videoUri);
    RNFS.unlink(global._thumbUri);

    global._videoUri = '';
    global._thumbUri = '';
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
    ['title', 'description']
      .map((name) => ({ name, ref: this[name] }))
      .forEach(({ name, ref }) => {
        if (ref.isFocused()) {
          this.setState({ [name]: text });
        }
      });
  };

  onSubmitTitle = () => {
    this.description.focus();
  };

  onPressPreview = () => {
    global._prevScreen = 'camera_upload';
    this.props.navigation.navigate('camera_preview');
  };

  onPressUploadPost = async () => {
    this.setState({ isVisibleDialog: false });
    let imageName = Helper.getFile4Path(global._thumbUri);
    const imageSource = {
      uri: global._thumbUri,
      name: imageName,
      type: 'image/jpeg',
    };
    const videoName = Helper.getFile4Path(global._videoUri);
    const videoSource = {
      uri: global._videoUri,
      name: videoName,
      type: 'video/mp4',
    };
    showForcePageLoader(true);
    const uploadedThumbUrl = await Global.uploadToCloudinary(
      imageSource,
      'temporary/postImages',
    );
    if (uploadedThumbUrl) {
      const uploadedVideoUrl = await Global.uploadToCloudinary(
        videoSource,
        'temporary/posts',
      );
      if (uploadedVideoUrl) {
        this.setState(
          {
            uploadedThumbUrl,
            uploadedVideoUrl,
          },
          this.uploadPostToBackend,
        );
      }
    }
    showForcePageLoader(false);
  };

  onPressCancelUpload = () => {
    this.setState({ isVisibleDialog: false });
  };

  onSubmit = () => {
    if (global.me?.userType === 0) {
      warning(Constants.WARNING_TITLE, 'Guest can not upload post.');
      return;
    }

    if (!global.me) {
      this.props.navigation.navigate('signin');
      return;
    }

    this.setState({ isVisibleDialog: true });
  };

  onBack = () => {
    const { isVisibleProgress } = this.state;

    if (!isVisibleProgress) {
      this.props.navigation.goBack();
    }

    return true;
  };

  render() {
    return (
      <>
        <SafeAreaView style={[GStyles.container, { paddingBottom: 36 }]}>
          {this._renderHeader()}
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={GStyles.elementContainer}
          >
            {this._renderMainInputs()}
            {this._renderButtons()}
          </KeyboardAwareScrollView>
          {this._renderProgress()}
          {this._renderDialog()}
        </SafeAreaView>
      </>
    );
  }

  _renderHeader = () => {
    return (
      <GHeaderBar
        headerTitle="Add Post"
        leftType="back"
        onPressLeftButton={this.onBack}
      />
    );
  };

  _renderMainInputs = () => {
    const { errors = {}, price, description, isPermanent } = this.state;

    return (
      <View>
        <View style={styles.textInput}>
          <TextField
            ref={this.titleRef}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={false}
            enablesReturnKeyAutomatically={true}
            onFocus={this.onFocus}
            onChangeText={this.onChangeText}
            onSubmitEditing={this.onSubmitTitle}
            returnKeyType="done"
            label="Title"
            value={price}
            error={errors.title}
          />
        </View>
        <View>
          <TextField
            ref={this.descriptionRef}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={this.onFocus}
            autoFocus={false}
            onChangeText={this.onChangeText}
            returnKeyType="next"
            label="Description"
            value={description}
            multiline={true}
            characterRestriction={120}
            error={errors.description}
          />
        </View>
      </View>
    );
  };

  _renderButtons = () => {
    return (
      <View style={{ zIndex: -1 }}>
        <View style={{ marginTop: 50 }}>
          <TouchableOpacity onPress={this.onPressPreview}>
            <View style={GStyles.buttonFill}>
              <Text style={GStyles.textFill}>Preview</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity onPress={this.onSubmit}>
            <View
              style={{
                ...GStyles.buttonFill,
                backgroundColor: GStyle.redColor,
              }}
            >
              <Text style={GStyles.textFill}>Upload</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  _renderProgress = () => {
    const { percent, isVisibleProgress } = this.state;

    return (
      <>
        {isVisibleProgress && (
          <>
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor: 'black',
                opacity: 0.4,
                zIndex: 100,
                elevation: 10,
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 101,
                elevation: 11,
              }}
            >
              <ProgressBar
                progress={percent * 0.01}
                width={WINDOW_WIDTH * 0.5}
                height={6}
                color={GStyle.activeColor}
                borderColor={'white'}
              />
              <Text
                style={{
                  ...GStyles.mediumText,
                  color: 'white',
                  marginTop: 10,
                }}
              >
                Uploading: {percent}%
              </Text>
            </View>
          </>
        )}
      </>
    );
  };

  _renderDialog = () => {
    const { isVisibleDialog } = this.state;

    return (
      <View>
        <Portal>
          <Dialog
            visible={isVisibleDialog}
            onDismiss={this.onPressCancelUpload}
          >
            <View style={{ ...GStyles.rowContainer }}>
              <FontAwesome
                name="warning"
                style={{
                  fontSize: 20,
                  color: '#f3430a',
                  marginLeft: 8,
                }}
              />
              <Dialog.Title style={{ marginLeft: 4 }}>Post Upload</Dialog.Title>
            </View>
            <Dialog.Content>
              <Paragraph>Are you sure?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={this.onPressUploadPost}>Post</Button>
              <Button onPress={this.onPressCancelUpload}>Cancel</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  textInput: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.8,
  },
});
export default (props) => {
  let navigation = useNavigation();
  let route = useRoute();
  return <PostUploadScreen {...props} navigation={navigation} route={route} />;
};
