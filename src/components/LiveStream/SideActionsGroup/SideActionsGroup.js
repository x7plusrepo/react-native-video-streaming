import React, { Component } from 'react';
import GradientBackgroundIconButton from './GradientBackgroundIconButton';
import ic_switch_camera from '../../../assets/images/Icons/ic_switch_camera.png';
import ic_share from '../../../assets/images/Icons/ic_share.png';
import ic_gift from '../../../assets/images/Icons/ic_gift.png';

export default class LiveStreamActionsGroup extends Component {
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

  onPressSwitchCamera = () => {
    const { onPressSwitchCamera } = this.props;
    onPressSwitchCamera && onPressSwitchCamera();
  };

  render() {
    const { mode } = this.props;
    return (
      <>
        {mode === 'streamer' && (
          <GradientBackgroundIconButton
            onPress={this.onPressSwitchCamera}
            icon={ic_switch_camera}
          />
        )}
        <GradientBackgroundIconButton icon={ic_share} />
        <GradientBackgroundIconButton
          onPress={this.onPressGiftAction}
          icon={ic_gift}
        />
      </>
    );
  }
}
