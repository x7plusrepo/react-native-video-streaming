import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import { ThemeProvider, Image, Button } from 'react-native-elements';
import { BallIndicator } from 'react-native-indicators';
import PropTypes from 'prop-types';
import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
} from '../utils/Global/index';

const PageLoaderIndicator = ({ isPageLoader = false }) => {
  if (!isPageLoader) {
    return null;
  }
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: Constants.WINDOW_WIDTH,
        height: Constants.WINDOW_HEIGHT,
        backgroundColor: 'rgba(13,13,13,0.4)',
        zIndex: 99999,
      }}
    >
      <BallIndicator color={'white'} />
    </View>
  );
};

PageLoaderIndicator.propTypes = {
  isPageLoader: PropTypes.bool,
};

PageLoaderIndicator.defaultProps = {
  isPageLoader: false,
};

export default PageLoaderIndicator;
