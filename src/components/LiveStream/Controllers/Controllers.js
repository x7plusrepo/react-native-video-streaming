import React, { Component } from 'react';
import GradientBackgroundIconButton from './GradientBackgroundIconButton';

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
    return (
      <>
        <GradientBackgroundIconButton
          onPress={this.onPressSwitchCamera}
          icon={require('../../../assets/images/Icons/ic_switch-camera.png')}
        />
        <GradientBackgroundIconButton
          onPress={this.onPressGiftAction}
          icon={require('../../../assets/images/Icons/ic_gift.png')}
        />
      </>
    );
  }
}
