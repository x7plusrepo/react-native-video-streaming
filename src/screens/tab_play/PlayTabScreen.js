import React, {Component} from 'react';
import {
  Alert,
  BackHandler,
  Button,
  Dimensions,
  Image,
  LayoutAnimation,
  LogBox,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import GHeaderBar from '../../components/GHeaderBar';

import {GStyle, GStyles, Global, Helper, Constants, RestAPI} from '../../utils/Global/index';

import PlayMainScreen from './PlayMainScreen';
import ProfileOtherScreen from '../tab_profile/ProfileOtherScreen';

const Tab = createMaterialTopTabNavigator();

class PlayTabScreen extends Component {
  constructor(props) {
    super(props);

    console.log('PlayTabScreen start');

    // crn_dev
    // global.debug = true;
    global.debug = false;
    global.socket = null;
    LogBox.ignoreAllLogs();

    this.init();
  }

  init = () => {
    this.state = {};
  };

  render() {
    return (
      <>
        <SafeAreaView style={{flex: 1}}>{this._renderTabBar()}</SafeAreaView>
      </>
    );
  }

  _renderTabBar = () => {
    return (
      <View />
    );
  };
}

const styles = StyleSheet.create({});

export default PlayTabScreen;
