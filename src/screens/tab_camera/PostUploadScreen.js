import React from 'react';
import {BackHandler, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {useNavigation, useRoute} from '@react-navigation/native';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {launchImageLibrary} from 'react-native-image-picker';

import ProgressBar from '../../lib/Progress/Bar';
import {Button, Dialog, Paragraph, Portal} from 'react-native-paper';
import {createThumbnail} from 'react-native-create-thumbnail';
import RNFS from 'react-native-fs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import GHeaderBar from '../../components/GHeaderBar';
import {TextField} from '../../lib/MaterialTextField/index';
import {Constants, Global, GStyle, GStyles, Helper, RestAPI} from '../../utils/Global';

import upload_icon from './../../assets/images/Icons/ic_upload_video.png';
import Video from 'react-native-video';
import CachedImage from '../../components/CachedImage';

const WINDOW_WIDTH = Helper.getWindowWidth();

class PostUploadScreen extends React.Component {
  constructor(props) {
    super(props);
    console.log('PostUploadScreen start');

    this.init();
  }

  componentDidMount() {
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
      videoUri: '',
      thumbUri: '',
      fileName: '',
      duration: 0,
      loading: false,
    };

    this.initRef();
  };

  onRefresh = () => {
    const { videoUri } = this.state;
    if (videoUri) {
      global.showForcePageLoader(true);
      createThumbnail({ url: videoUri })
        .then((response) => {
          this.setState({ thumbUri: response.path });
          global._thumbUri = response.path;
          global.showForcePageLoader(false);
        })
        .catch((err) => {
          console.log({ err });
          global.showForcePageLoader(false);
          global._thumbUri = '';
          this.setState({ thumbUri: '' });
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

  onPressImport = async () => {
    const granted = await Global.checkPermissionsForStorage();
    if (granted) {
      launchImageLibrary(
        {
          height: 300,
          width: 300,
          mediaType: 'video',
        },
        async (response) => {
          if (response?.didCancel) {
            console.log('User cancelled image picker');
          } else if (response?.errorMessage) {
            console.log('ImagePicker Error: ', response?.error);
          } else {
            try {
              console.log(response);
              const uri = response?.uri;
              global._videoUri = uri;
              this.setState(
                {
                  videoUri: uri,
                  fileName: response?.fileName,
                },
                () => {
                  this.onRefresh();
                },
              );
            } catch (error) {
              console.log(error);
              global.warning('Warning', 'Error while importing video.');
            }
          }
        },
      );
    } else {
      global.warning('Warning', 'Permission is denied.');
    }
  };

  uploadPostToBackend = () => {
    const { title, description, uploadedThumbUrl, uploadedVideoUrl } =
      this.state;

    if (!uploadedThumbUrl || !uploadedVideoUrl) {
      alert('Resource not found.');
    }

    global.showForcePageLoader(true);
    const params = {
      userId: global.me?.id,
      url: uploadedVideoUrl,
      thumb: uploadedThumbUrl,
      title,
      description: description,
    };

    RestAPI.add_post(params, async (json, err) => {
      global.showForcePageLoader(false);
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
    try {
      const { thumbUri, videoUri } = this.state;
      RNFS.unlink(thumbUri);
      RNFS.unlink(videoUri);
    } catch (error) {
      console.log(error);
    }
    this.setState({ thumbUri: '', videoUri: '' });
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

  onPressUploadPost = async () => {
    this.setState({ isVisibleDialog: false });
    const { thumbUri, videoUri, duration } = this.state;
    if (!videoUri || !thumbUri) {
      global.warning('Warning', 'Empty source.');
      return;
    }

    if (duration === 0) {
      global.warning('Warning', 'Invalid video.');
      return;
    }
    if (duration > 15 ) {
      global.warning('Warning', 'Sorry the video is too long, max duration is 15sec.');
      return;
    }
    this.setState({ isVisibleDialog: false });
    let imageName = Helper.getFile4Path(thumbUri);
    const imageSource = {
      uri: thumbUri,
      name: imageName,
      type: 'image/jpeg',
    };
    const videoName = Helper.getFile4Path(videoUri);
    const videoSource = {
      uri: videoUri,
      name: videoName,
      type: 'video/mp4',
    };
    global.showForcePageLoader(true);
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
    global.showForcePageLoader(false);
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
        <SafeAreaView style={styles.container}>
          {this._renderHeader()}
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            {this._renderUpload()}
            {this._renderVideo()}
            <View style={{ paddingHorizontal: 16 }}>
              {this._renderMainInputs()}
              {this._renderButtons()}
            </View>
          </KeyboardAwareScrollView>
          {this._renderProgress()}
          {this._renderDialog()}
        </SafeAreaView>
      </>
    );
  }

  onLoad = (data) => {
    const duration = data?.duration || 0;
    this.setState({ loading: false, duration });
    if (duration > 15 ) {
      global.warning('Warning', 'Sorry the video is too long, max duration is 15sec.');
    }
  };

  onLoadStart = () => {
    this.setState({ loading: true, duration: 0 });
  };

  onVideoError = () => {
    this.setState({ loading: false, duration: 0 });
    alert(0);
  };

  _renderVideo = () => {
    const { videoUri, thumbUri, fileName } = this.state;
    return (
      <View style={styles.videoContainer}>
        <View style={styles.videoSubContainer}>
          { !!videoUri &&
          <Video
            source={{ uri: videoUri }}
            repeat
            poster={thumbUri}
            resizeMode="contain"
            posterResizeMode="contain"
            // bufferConfig={{
            //   minBufferMs: 15000,
            //   maxBufferMs: 30000,
            //   bufferForPlaybackMs: 5000,
            //   bufferForPlaybackAfterRebufferMs: 5000,
            // }}
            style={styles.video}
            onLoad={this.onLoad}
            onLoadStart={this.onLoadStart}
            onError={this.onVideoError}
          />
          }

        </View>
      </View>
    );
  };

  _renderUpload = () => {
    const { videoUri, thumbUri, fileName } = this.state;
    const videoName = Helper.getFile4Path(videoUri);

    return (
      <TouchableOpacity
        style={styles.uploadContainer}
        onPress={this.onPressImport}
      >
        <View style={styles.uploadSub}>
          {!!videoUri && !!thumbUri ? (
            <View style={styles.thumbContainer}>
              <CachedImage source={{ uri: thumbUri }} style={styles.thumb} />
              <Text style={styles.fileName}>{videoName}</Text>
            </View>
          ) : (
            <View>
              <CachedImage source={upload_icon} style={styles.thumb} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
    const { errors = {}, price, description } = this.state;

    return (
      <>
        <TextField
          ref={this.titleRef}
          //autoCapitalize="none"
          // autoCorrect={false}
          // autoFocus={false}
          enablesReturnKeyAutomatically={true}
          onChangeText={this.onChangeText}
          onSubmitEditing={this.onSubmitTitle}
          returnKeyType="next"
          label="Title"
          value={price}
        />
        <TextField
          ref={this.descriptionRef}
          //autoCapitalize="none"
          // autoCorrect={false}
          // autoFocus={false}
          onChangeText={this.onChangeText}
          returnKeyType="done"
          label="Description"
          value={description}
          multiline={true}
          characterRestriction={120}
        />
      </>
    );
  };

  _renderButtons = () => {
    const { videoUri, loading } = this.state;
    const disabled = loading || !!!videoUri;

    return (
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity onPress={this.onSubmit} disabled={disabled}>
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
  uploadContainer: {
    marginVertical: 24,
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  uploadSub: {
    paddingVertical: 24,
    marginHorizontal: 16,
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 32,
    shadowOffset: {
      width: 2,
      height: 8,
    },
    shadowRadius: 12,
    shadowOpacity: 0.2,
  },
  container: {
    paddingBottom: 36,
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumb: {
    width: 105,
    height: 105,
  },
  fileName: {
    ...GStyles.textMedium,
    marginLeft: 16,
  },
  thumbContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoSubContainer: {
    elevation: 32,
    shadowOffset: {
      width: 2,
      height: 8,
    },
    shadowRadius: 12,
    shadowOpacity: 0.2,
    backgroundColor: 'black',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    height: 250,
  },
  videoContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});

export default (props) => {
  let navigation = useNavigation();
  let route = useRoute();
  return <PostUploadScreen {...props} navigation={navigation} route={route} />;
};
