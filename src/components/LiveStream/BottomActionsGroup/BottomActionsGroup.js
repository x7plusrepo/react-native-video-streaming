import React, { Component } from 'react';
import { View } from 'react-native';
import { GStyles } from '../../../utils/Global/Styles';
import GradientBackgroundIconButton from './GradientBackgroundIconButton';
import MessagesList from '../MessagesList';

import ic_switch_camera from '../../../assets/images/Icons/ic_switch_camera.png';
import ic_menu_messages from '../../../assets/images/Icons/ic_menu_messages.png';
import ic_share from '../../../assets/images/Icons/ic_share.png';
import ic_gift from '../../../assets/images/Icons/ic_gift.png';
import heart from '../../../assets/images/gifts/heart.png';
import MessageBox from './MessageBox';
import RBSheet from 'react-native-raw-bottom-sheet';
import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view';

const ic_audio_on = require('../../../assets/images/Icons/ic_audio_on.png');
const ic_audio_off = require('../../../assets/images/Icons/ic_audio_off.png');

export default class BottomActionsGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
    };
  }

  onPressSendHeart = () => {
    const { onPressSendHeart } = this.props;
    onPressSendHeart && onPressSendHeart();
  };

  onPressGiftAction = () => {
    const { onPressGiftAction } = this.props;
    onPressGiftAction && onPressGiftAction();
  };

  onPressShareAction = () => {
    const { onPressShareAction } = this.props;
    onPressShareAction && onPressShareAction();
  };

  onPressSwitchCamera = () => {
    const { onPressSwitchCamera } = this.props;
    onPressSwitchCamera && onPressSwitchCamera();
  };

  onPressSwitchAudio = () => {
    const { onPressSwitchAudio } = this.props;
    onPressSwitchAudio && onPressSwitchAudio();
  };

  renderContent() {
    const { mode, method, onPressSendMessage, messages } = this.props;

    return (
      <>
        <View
          style={[
            GStyles.rowContainer,
            { alignItems: 'flex-end', marginBottom: 24 },
          ]}
        >
          <MessagesList
            messages={messages}
            onPressProfileAction={this.props.onPressProfileAction}
          />
          <View>
            {mode === 'streamer' && method === 0 && (
              <GradientBackgroundIconButton
                onPress={this.onPressSwitchCamera}
                icon={ic_switch_camera}
                iconStyle={{ tintColor: 'white' }}
                containerStyle={{ marginRight: 0, marginBottom: 8 }}
              />
            )}

            {mode === 'viewer' && (
              <GradientBackgroundIconButton
                icon={ic_share}
                onPress={this.onPressShareAction}
              />
            )}
          </View>
        </View>
        <View style={GStyles.rowContainer}>
          <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
            <MessageBox onPressSendMessage={onPressSendMessage} />
          </KeyboardAwareScrollView>
          {mode === 'streamer' && (
            <GradientBackgroundIconButton
              icon={ic_share}
              onPress={this.onPressShareAction}
              containerStyle={{ marginLeft: 8 }}
            />
          )}

          {mode === 'viewer' && (
            <GradientBackgroundIconButton
              icon={heart}
              onPress={this.onPressSendHeart}
              containerStyle={{ marginLeft: 8 }}
            />
          )}
          {mode === 'viewer' && (
            <GradientBackgroundIconButton
              icon={ic_gift}
              onPress={this.onPressGiftAction}
              containerStyle={{ marginLeft: 8 }}
            />
          )}
        </View>
      </>
    );
  }

  render() {
    return (
      <View style={{ paddingHorizontal: 16 }}>{this.renderContent()}</View>
    );
  }
}
