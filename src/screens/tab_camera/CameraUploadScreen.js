import React from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view';
import DropDownPicker from 'react-native-dropdown-picker';

import ProgressBar from '../../lib/Progress/Bar';
import { Button, Paragraph, Dialog, Portal } from 'react-native-paper';
import { createThumbnail } from 'react-native-create-thumbnail';
import TagInput from '../../lib/react-native-tag-input/index';
import VideoUpload from '../../utils/NativeModule/NativePackage';
import RNFS from 'react-native-fs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { TextField } from '../../lib/MaterialTextField/index';
import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
  RestAPI,
} from '../../utils/Global';
import GHeaderBar from '../../components/GHeaderBar';

import { connect } from 'react-redux';
import { setCategories } from '../../redux/categories/actions';

const img_default_avatar = require('../../assets/images/Icons/ic_default_avatar.png');

const WINDOW_WIDTH = Helper.getWindowWidth();

const inputProps = {
  keyboardType: 'default',
  placeholder: '',
  autoFocus: false,
  style: {
    ...GStyles.regularText,
    marginVertical: Platform.OS === 'ios' ? 10 : -2,
  },
};

class CameraUploadScreen extends React.Component {
  constructor(props) {
    super(props);
    console.log(props.categories, '0000');
    console.log('CameraUploadScreen start');

    this.init();
    this.setOpenCategoryDropdown = this.setOpenCategoryDropdown.bind(this);
    this.setOpenSubCategoryDropdown =
      this.setOpenSubCategoryDropdown.bind(this);
    this.setCategories = this.setCategories.bind(this);
    this.setCategory = this.setCategory.bind(this);
    this.setSubCategories = this.setSubCategories.bind(this);
    this.setSubCategory = this.setSubCategory.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;

    const eventEmitter = new NativeEventEmitter(VideoUpload);
    this.eventListener = eventEmitter.addListener(
      'EventUploadProgress',
      (event) => {
        console.log(event);
        if (!this._isMounted) {
          return;
        }
        this.setState({ percent: event.percent });
        if (event.percent == 100 && event.url) {
          const curTimeTick = Helper.getTimeStamp();
          const uploadInterval = curTimeTick - this._timeTick;
          this._timeTick = curTimeTick;
          if (uploadInterval > 5000) {
            if (this.state.uploadMode === 'image') {
              this.setState({ thumb: event.url });
              this.uploadVideoToCloudinary();
            } else {
              this.uploadVideoToBackend(event.url);
            }
          }
        } else if (event.percent < 0) {
          this.setState({
            isVisibleProgress: false,
            uploadMode: 'image',
            thumb: '',
          });
          error(Constants.ERROR_TITLE, 'Failed to upload video3');
        }
      },
    );

    this.onRefresh();

    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      if (Platform.OS === 'android') {
        Helper.setLightStatusBar();
      }
    });

    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBack,
    );
    this.refreshCategories();
  }

  refreshCategories = () => {
    const { isFetching } = this.state;
    if (isFetching) {
      return;
    }
    let params = {
      user_id: global.me ? global.me?.id : '',
    };
    showForcePageLoader(true);
    RestAPI.get_product_categories(params, (json, error) => {
      this.setState({ isFetching: false });
      showForcePageLoader(false);

      if (error !== null) {
        Helper.alertNetworkError(error?.message);
      } else {
        if (json.status === 200) {
          const response = json.data || [];
          this.props.setCategories(response);
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  componentDidUpdate(
    prevProps: Readonly<P>,
    prevState: Readonly<S>,
    snapshot: SS,
  ): void {
    if (prevProps.categories !== this.props.categories) {
      const categories = this.props.categories
        ?.filter((category) => !!!category.parent)
        ?.map((category) => ({
          label: category?.title,
          value: category?.id,
        }));
      this.setState({ categories });
    }

    if (prevState.category !== this.state.category) {
      const subCategories = this.props.categories
        .filter((category) => category.parent?.id === this.state.category)
        .map((category) => ({
          label: category?.title,
          value: category?.id,
        }));
      this.setState({ subCategories });
    }
  }

  setOpenCategoryDropdown(open) {
    console.log(open)
    this.setState({
      openCategoryDropdown: open,
      zIndexCategory: open ? 9999 : 999,
      zIndexSubCategory: open ? 999 : 9999,
    });
  }

  setCategory(callback) {
    this.setState((state) => ({
      category: callback(state.category),
    }));
  }

  setCategories(callback) {
    this.setState((state) => ({
      categories: callback(state.categories)
    }));
  }

  setOpenSubCategoryDropdown(open) {
    this.setState({
      openSubCategoryDropdown: open,
      zIndexSubCategory: open ? 9999 : 999,
      zIndexCategory: open ? 999 : 9999,
    });
  }

  setSubCategory(callback) {
    this.setState((state) => ({
      subCategory: callback(state.subCategory),
    }));
  }

  setSubCategories(callback) {
    this.setState((state) => ({
      subCategories: callback(state.subCategories),
    }));
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      this.eventListener.remove(); //Removes the listener
    }

    this.unsubscribe();
    BackHandler.removeEventListener('hardwareBackPress', this.onBack);
    this._isMounted = false;
  }

  init = () => {
    this.state = {
      isVisibleProgress: false,
      isVisibleDialog: false,
      percent: 0,

      tags: [],
      text: '',
      thumb: '',
      uploadMode: 'image',
      price: '',
      description: '',
      category: null,
      categories: [],
      zIndexCategory: 9999,
      zIndexSubCategory: 9999,
      subCategory: null,
      subCategories: [],
      openCategoryDropdown: false,
      openSubCategoryDropdown: false,
    };

    this._isMounted = false;
    this._timeTick = 0;

    this.initRef();
  };

  onRefresh = () => {
    if (global._prevScreen != 'camera_preview') {
      showForcePageLoader(true);
      createThumbnail({ url: global._videoUri })
        .then((response) => {
          global._thumbUri = response.path;
          console.log(response.path);
          showForcePageLoader(false);

          this.saveDraft();
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
    this.priceRef = (ref) => {
      this.price = ref;
    };
    this.descriptionRef = (ref) => {
      this.description = ref;
    };
  };

  saveDraft = async () => {
    try {
      const videoDraft = await Helper.getLocalValue(Constants.KEY_VIDEO_DRAFT);
      let videoArray = [];
      if (videoDraft != null) {
        videoArray = JSON.parse(videoDraft);
      }

      let filename = Helper.getFile4Path(global._videoUri);
      const videoDraftPath =
        'file://' + Helper.getDraftDirectoryPath() + filename;
      RNFS.moveFile(global._videoUri, videoDraftPath);
      filename = Helper.getFile4Path(global._thumbUri);
      global._videoUri = videoDraftPath;
      const thumbDraftPath =
        Platform.OS === 'ios'
          ? Helper.getDraftDirectoryPath() + filename
          : 'file://' + Helper.getDraftDirectoryPath() + filename;
      RNFS.moveFile(global._thumbUri, thumbDraftPath);
      global._thumbUri = thumbDraftPath;

      const itemDatas = [
        ...videoArray,
        { video: videoDraftPath, thumb: thumbDraftPath },
      ];
      await Helper.setLocalValue(
        Constants.KEY_VIDEO_DRAFT,
        JSON.stringify(itemDatas),
      );
    } catch (e) {
      // error reading value
    }
  };

  uploadVideoToCloudinary = () => {
    this.setState({ percent: 0, isVisibleProgress: true, uploadMode: 'video' });

    if (Platform.OS === 'android') {
      const split = global._videoUri?.split(':') || [];
      const videoUrl = split[1]?.substring(2);
      VideoUpload.upload(
        videoUrl,
        'work/',
        'video',
        (msg) => {
          this.uploadVideoToBackend(msg);
        },
        (msg) => {
          console.log('onError', msg);
          this.setState({ isVisibleProgress: false });
          error(Constants.ERROR_TITLE, 'Failed to upload video');
        },
      );
    } else {
      VideoUpload.upload(
        global._videoUri,
        'work/',
        'video',
        (error, respArray) => {},
      );
    }
  };

  uploadImageToCloudinary = () => {
    this.setState({ percent: 0, isVisibleProgress: true, uploadMode: 'image' });
    if (Platform.OS === 'android') {
      const split = global._thumbUri?.split(':') || [];
      const imageUrl = split[1]?.substring(2);
      VideoUpload.upload(
        imageUrl,
        'images/',
        'image',
        (msg) => {
          this.setState({ thumb: msg });
          this.uploadVideoToCloudinary();
        },
        (msg) => {
          console.log('onError', msg);
          this.setState({ isVisibleProgress: false, thumb: '' });
          error(Constants.ERROR_TITLE, 'Failed to upload image');
        },
      );
    } else {
      VideoUpload.upload(
        global._videoUri,
        'images/',
        'image',
        (error, respArray) => {},
      );
    }
  };

  uploadVideoToBackend = (cloudinaryUrl) => {
    const { tags, price, description, thumb, category, subCategory } =
      this.state;

    showForcePageLoader(true);
    const tagSet = tags.join(',');
    const params = {
      user_id: global.me?.id,
      uploaded_url: cloudinaryUrl,
      thumb,
      tags: tagSet,
      price: parseInt(price) || 0,
      description: description,
      number: (Number(global.me.uploadCount || 0) + 1).toString(),
      category,
      subCategory,
    };
    console.log(params)
    RestAPI.add_video(params, async (json, err) => {
      showForcePageLoader(false);
      if (err !== null) {
        this.setState({
          isVisibleProgress: false,
          uploadMode: 'image',
          thumb: '',
        });
        error(Constants.ERROR_TITLE, 'Failed to upload video1');
        if (global._prevScreen == 'camera_main') {
          this.props.navigation.goBack();
        } else {
          this.props.navigation.navigate('camera_draft');
        }
      } else {
        if (json.status === 201) {
          this.setState({
            isVisibleProgress: false,
            uploadMode: 'image',
            thumb: '',
          });
          global.me.upload_count = Number(global.me.uploadCount || 0) + 1;
          success(Constants.SUCCESS_TITLE, 'Success to upload video');
          await this.deleteVideo();
          if (global._prevScreen == 'camera_main') {
            this.props.navigation.goBack();
          } else {
            this.props.navigation.navigate('camera_draft');
          }
        } else {
          this.setState({
            isVisibleProgress: false,
            uploadMode: 'image',
            thumb: '',
          });
          error(Constants.ERROR_TITLE, 'Failed to upload video2');
          if (global._prevScreen == 'camera_main') {
            this.props.navigation.goBack();
          } else {
            this.props.navigation.navigate('camera_draft');
          }
        }
      }
    });
  };

  deleteVideo = async () => {
    RNFS.unlink(global._videoUri);
    RNFS.unlink(global._thumbUri);

    try {
      const videoDraft = await Helper.getLocalValue(Constants.KEY_VIDEO_DRAFT);
      let videoArray = [];
      if (videoDraft != null) {
        videoArray = JSON.parse(videoDraft);
      }

      let matchIndex = -1;
      for (const index in videoArray) {
        if (videoArray[index].video == global._videoUri) {
          matchIndex = index;
        }
      }
      if (matchIndex !== -1) {
        videoArray.splice(matchIndex, 1);
      }

      await Helper.setLocalValue(
        Constants.KEY_VIDEO_DRAFT,
        JSON.stringify(videoArray),
      );

      global._videoUri = '';
      global._thumbUri = '';
    } catch (e) {
      // error reading value
    }
  };

  onChangeTags = (tags) => {
    this.setState({ tags });
  };

  onChangeTagText = (text) => {
    const lastTyped = text.charAt(text.length - 1);
    const parseWhen = [',', ' ', ';', '\n'];

    if (text.length == 1) {
      if (parseWhen.indexOf(text.charAt(0)) > -1) {
        return;
      }
    }

    this.setState({ text });

    if (parseWhen.indexOf(lastTyped) > -1) {
      this.setState({
        tags: [...this.state.tags, this.state.text],
        text: '',
      });
    }
  };

  onBlurTagInput = () => {
    const { text } = this.state;

    const newText = text + ',';
    this.onChangeTagText(newText);
  };

  labelExtractor = (tag) => tag;

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
    ['price', 'description']
      .map((name) => ({ name, ref: this[name] }))
      .forEach(({ name, ref }) => {
        if (ref.isFocused()) {
          this.setState({ [name]: text });
        }
      });
  };

  onSubmitPrice = () => {
    this.description.focus();
  };

  onPressPreview = () => {
    global._prevScreen = 'camera_upload';
    this.props.navigation.navigate('camera_preview');
  };

  onPressDraft = () => {
    this.props.navigation.navigate('camera_draft');
  };

  onPressUploadVideo = () => {
    this.setState({ isVisibleDialog: false });
    this.uploadImageToCloudinary();
  };

  onPressCancelUpload = () => {
    this.setState({ isVisibleDialog: false });
  };

  onSubmit = () => {
    const { tags } = this.state;
    let errors = {};

    // if (global.me?.userType === 0) {
    //   warning(Constants.WARNING_TITLE, 'Guest can not upload video.');
    //   return;
    // }

    if (!global.me) {
      this.props.navigation.navigate('signin');
      return;
    }

    if (tags.length < 1) {
      Alert.alert('Please input tag');
      return;
    }

    ['price'].forEach((name) => {
      let value = this[name].value();

      if (!value) {
        errors[name] = 'Should not be empty';
      }
    });

    this.setState({ errors });

    const errorCount = Object.keys(errors).length;
    if (errorCount < 1) {
      this.setState({ isVisibleDialog: true });
    }
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
        <SafeAreaView style={GStyles.container}>
          {this._renderHeader()}
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={GStyles.elementContainer}
          >
            {this._renderTagInput()}
            {this._renderMainInputs()}
            {this._renderCategories()}
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
        headerTitle="Video Upload"
        leftType="back"
        onPressLeftButton={this.onBack}
      />
    );
  };

  _renderCategories = () => {
    const {
      categories,
      subCategories,
      category,
      subCategory,
      openCategoryDropdown,
      openSubCategoryDropdown,
      zIndexCategory,
      zIndexSubCategory,
    } = this.state;

    return (
      <View>
        <Text
          style={{ ...GStyles.mediumText, marginTop: 20, marginBottom: 12 }}
        >
          Category
        </Text>
        <DropDownPicker
          loading={true}
          search={true}
          open={openCategoryDropdown}
          value={category}
          items={categories}
          setOpen={this.setOpenCategoryDropdown}
          setValue={this.setCategory}
          setItems={this.setCategories}
          zIndex={zIndexCategory}
          zIndexInverse={zIndexCategory}
        />
        <Text
          style={{ ...GStyles.mediumText, marginTop: 20, marginBottom: 12 }}
        >
          Sub Category
        </Text>
        <DropDownPicker
          open={openSubCategoryDropdown}
          value={subCategory}
          items={subCategories}
          setOpen={this.setOpenSubCategoryDropdown}
          setValue={this.setSubCategory}
          setItems={this.setSubCategories}
          zIndex={zIndexSubCategory}
          zIndexInverse={zIndexSubCategory}
        />
      </View>
    );
  };

  _renderTagInput = () => {
    const { tags } = this.state;

    return (
      <View
        style={{
          ...GStyles.borderBottom,
          flex: 1,
          marginTop: 30,
        }}
      >
        <Text style={{ ...GStyles.mediumText, marginTop: 20 }}>Tags</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#00000011',
            borderRadius: 10,
            marginTop: 8,
            paddingHorizontal: 8,
          }}
        >
          <TagInput
            value={tags}
            onChange={this.onChangeTags}
            labelExtractor={this.labelExtractor}
            text={this.state.text}
            onChangeText={this.onChangeTagText}
            onBlur={this.onBlurTagInput}
            tagColor="#888888"
            tagTextColor="white"
            tagContainerStyle={{ paddingHorizontal: 4, paddingVertical: 0 }}
            inputProps={inputProps}
            maxHeight={200}
          />
        </View>
      </View>
    );
  };

  _renderMainInputs = () => {
    const { errors = {}, price, description } = this.state;

    return (
      <View>
        <TextField
          ref={this.priceRef}
          keyboardType="number-pad"
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          onSubmitEditing={this.onSubmitPrice}
          returnKeyType="done"
          label="Price"
          value={price}
          error={errors.price}
          containerStyle={{ marginTop: 8 }}
        />
        <TextField
          ref={this.descriptionRef}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          returnKeyType="next"
          label="Description"
          value={description}
          multiline={true}
          characterRestriction={120}
          error={errors.description}
        />
      </View>
    );
  };

  _renderButtons = () => {
    return (
      <>
        <View style={{ marginTop: 50 }}>
          <TouchableOpacity onPress={this.onPressPreview}>
            <View style={GStyles.buttonFill}>
              <Text style={GStyles.textFill}>Preview</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity onPress={this.onPressDraft}>
            <View style={GStyles.buttonFill}>
              <Text style={GStyles.textFill}>Draft</Text>
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
      </>
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
            ></View>
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
              <Dialog.Title style={{ marginLeft: 4 }}>
                Video Upload
              </Dialog.Title>
            </View>
            <Dialog.Content>
              <Paragraph>
                ভিডিও আপলোড করার পর আপনি ভিডিও ডিলিট করতে পারবেন না. ৩০দিন পর
                ভিডিও অটো ডিলিট হয়ে যাবে!
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={this.onPressUploadVideo}>Upload</Button>
              <Button onPress={this.onPressCancelUpload}>Cancel</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        {/* <Dialog.Container visible={isVisibleDialog}>
          <View style={{...GStyles.rowContainer}}>
            <FontAwesome
              name="warning"
              style={{
                fontSize: 20,
                color: '#f3430a',
                marginLeft: Platform.OS == 'ios' ? 8 : 0,
              }}
            />
            <Dialog.Title style={{marginLeft: 4}}>Video Upload</Dialog.Title>
          </View>
          <View>
            <Dialog.Description>
              ভিডিও আপলোড করার পর আপনি ভিডিও ডিলিট করতে পারবেন না. ৩০দিন পর
              ভিডিও অটো ডিলিট হয়ে যাবে!
            </Dialog.Description>
          </View>
          <Dialog.Button label="Upload" onPress={this.onPressUploadVideo} />
          <Dialog.Button label="Cancel" onPress={this.onPressCancelUpload} />
        </Dialog.Container> */}
      </View>
    );
  };
}

const styles = StyleSheet.create({});

const TCameraUploadScreen = (props) => {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <CameraUploadScreen {...props} navigation={navigation} route={route} />
  );
};

export default connect(
  (state) => ({
    categories: state.categories?.categories,
  }),
  { setCategories },
)(TCameraUploadScreen);
