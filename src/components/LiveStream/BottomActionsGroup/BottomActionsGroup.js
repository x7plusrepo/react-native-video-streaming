import React, {Component} from 'react';
import {View} from 'react-native';
import {GStyles} from '../../../utils/Global/Styles';
import GradientBackgroundIconButton from './GradientBackgroundIconButton';
import MessagesList from '../MessagesList';

import ic_switch_camera from '../../../assets/images/Icons/ic_switch_camera.png';
import ic_menu_messages from '../../../assets/images/Icons/ic_menu_messages.png';
import ic_share from '../../../assets/images/Icons/ic_share.png';
import ic_gift from '../../../assets/images/Icons/ic_gift.png';
import ic_join from '../../../assets/images/Icons/ic_join.png';
import ic_signOut from '../../../assets/images/Icons/ic_signout.png';
import heart from '../../../assets/images/gifts/heart.png';

const ic_audio_on = require('../../../assets/images/Icons/ic_audio_on.png');
const ic_audio_off = require('../../../assets/images/Icons/ic_audio_off.png');
const ic_star = require('../../../assets/images/Icons/ic_star.png');

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

  onPressMessageAction = () => {
    const { onPressMessageAction } = this.props;
    onPressMessageAction && onPressMessageAction();
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
    const { mode, isJoined, onPressJoin, onExit, isMuted, messages } =
      this.props;
    const onPressJoinButton = isJoined ? onExit : onPressJoin;
    const joinLeaveIcon = isJoined ? ic_signOut : ic_join;

    return (
      <>
        <View
          style={[
            GStyles.rowContainer,
            { alignItems: 'flex-end', marginBottom: 24 },
          ]}
        >
          <MessagesList messages={messages} />
          {mode === 'streamer' && (
            <View>
              <GradientBackgroundIconButton
                onPress={this.onPressSwitchCamera}
                icon={ic_switch_camera}
                iconStyle={{ tintColor: 'white' }}
                containerStyle={{ marginRight: 0, marginBottom: 8 }}
              />
              <GradientBackgroundIconButton
                onPress={this.onPressSwitchAudio}
                icon={isMuted ? ic_audio_off : ic_audio_on}
                iconStyle={{ tintColor: 'white' }}
                containerStyle={{ marginRight: 0 }}
              />
            </View>
          )}
        </View>
        <View style={GStyles.rowBetweenContainer}>
          <View style={GStyles.rowBetweenContainer}>
            <GradientBackgroundIconButton
              onPress={this.onPressMessageAction}
              icon={ic_menu_messages}
            />
            {/*{mode === 'viewer' && (*/}
            {/*  <GradientBackgroundIconButton*/}
            {/*    onPress={onPressJoinButton}*/}
            {/*    icon={joinLeaveIcon}*/}
            {/*  />*/}
            {/*)}*/}

            <GradientBackgroundIconButton
              icon={ic_share}
              onPress={this.onPressShareAction}
            />
          </View>

          <View style={GStyles.rowBetweenContainer}>
            {mode === 'viewer' && (
              <GradientBackgroundIconButton
                icon={heart}
                onPress={this.onPressSendHeart}
                containerStyle={{ marginLeft: 8, marginRight: 0 }}
              />
            )}
            {mode === 'viewer' && (
              <GradientBackgroundIconButton
                icon={ic_gift}
                onPress={this.onPressGiftAction}
                containerStyle={{ marginLeft: 8, marginRight: 0 }}
              />
            )}
          </View>
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
