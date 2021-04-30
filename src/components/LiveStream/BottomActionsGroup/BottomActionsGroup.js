import React, { Component } from 'react';
import { View, Platform } from 'react-native';
import KeyboardAccessory from 'react-native-sticky-keyboard-accessory';
import { GStyles } from '../../../utils/Global/Styles';
import GradientBackgroundIconButton from './GradientBackgroundIconButton';

import { LIVE_STATUS } from '../../../utils/LiveStream/Constants';

import ic_switch_camera from '../../../assets/images/Icons/ic_switch_camera.png';
import ic_menu_messages from '../../../assets/images/Icons/ic_menu_messages.png';
import ic_share from '../../../assets/images/Icons/ic_share.png';
import ic_gift from '../../../assets/images/Icons/ic_gift.png';
import ic_join from '../../../assets/images/Icons/ic_join.png';
import ic_signOut from '../../../assets/images/Icons/ic_signout.png';

export default class BottomActionsGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
    };
  }

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
  }

  onPressSwitchCamera = () => {
    const { onPressSwitchCamera } = this.props;
    onPressSwitchCamera && onPressSwitchCamera();
  };

  renderContent() {
    const { mode, isJoined, onPressJoin, onExit } = this.props;
    const onPressJoinButton = isJoined ? onExit : onPressJoin;
    const joinLeaveIcon = isJoined ? ic_signOut : ic_join;

    return (
      <View style={GStyles.rowBetweenContainer}>
        <View style={GStyles.rowContainer}>
          <GradientBackgroundIconButton
            onPress={this.onPressMessageAction}
            icon={ic_menu_messages}
          />
          {mode === 'streamer' && (
            <GradientBackgroundIconButton
              onPress={this.onPressSwitchCamera}
              icon={ic_switch_camera}
              iconStyle={{ tintColor: 'white' }}
            />
          )}
          <GradientBackgroundIconButton icon={ic_share} onPress={this.onPressShareAction} />
        </View>

        <View style={GStyles.rowContainer}>
          <GradientBackgroundIconButton
            onPress={this.onPressGiftAction}
            icon={ic_gift}
            containerStyle={{ marginLeft: 8, marginRight: 0 }}
          />
          {mode === 'viewer' && (
            <GradientBackgroundIconButton
              onPress={onPressJoinButton}
              icon={joinLeaveIcon}
              containerStyle={{ marginLeft: 8, marginRight: 0 }}
            />
          )}
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={{ paddingHorizontal: 16 }}>
        {Platform.OS === 'android' ? (
          this.renderContent()
        ) : (
          <KeyboardAccessory backgroundColor="transparent">
            {this.renderContent()}
          </KeyboardAccessory>
        )}
      </View>
    );
  }
}
