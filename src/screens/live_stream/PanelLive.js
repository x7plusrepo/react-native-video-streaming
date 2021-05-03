import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import Avatar from '../../components/elements/Avatar';
import avatars from '../../assets/avatars';
import Helper from '../../utils/Global/Util';
import GStyle, { GStyles } from '../../utils/Global/Styles';
import styles from './styles';

import ic_close from '../../assets/images/Icons/ic_close.png';
const randomNumber = Math.floor(Math.random() * avatars.length);
const randomImageUrl = avatars[randomNumber];

const PanelLive = (props) => {
  const { onPressStart, currentLiveStatus } = props;
  const [topic, setTopic] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const onChangeText = (text) => setTopic(text);
  const onStart = async () => {
    showForcePageLoader(true);
    const uploadedUrl = await Helper.uploadImageToCloudinary(thumbnail);
    showForcePageLoader(false);
    onPressStart && onPressStart(topic, uploadedUrl);
  };
  const onPressClose = () => {
    const { onPressClose } = props;
    onPressClose && onPressClose();
  };

  const onPressThumbnail = () => {
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
          setThumbnail(source);
        }
      },
    );
  };

  const avatar = { uri: thumbnail ? thumbnail.uri || '' : randomImageUrl };

  return (
    <View style={style.container}>
      <View>
        <View style={[GStyles.rowEndContainer, { paddingHorizontal: 16 }]}>
          <TouchableOpacity onPress={onPressClose}>
            <Image
              style={GStyles.actionIcons}
              source={ic_close}
              tintColor="white"
            />
          </TouchableOpacity>
        </View>

        <View style={style.top}>
          <TouchableOpacity
            onPress={onPressThumbnail}
            style={style.thumbnailContainer}
          >
            <Avatar image={avatar} size={82} />
          </TouchableOpacity>
          <TextInput
            style={styles.topicInput}
            placeholder="Pick a topic to chat?"
            underlineColorAndroid="transparent"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="white"
            onChangeText={onChangeText}
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={onStart}
        style={[
          styles.btnBeginLiveStream,
          { backgroundColor: GStyle.primaryColor },
        ]}
        disabled={currentLiveStatus === -1}
      >
        <Text style={styles.beginLiveStreamText}>Go LIVE</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PanelLive;

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 72,
  },
  thumbnailContainer: {
    marginRight: 16,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});
