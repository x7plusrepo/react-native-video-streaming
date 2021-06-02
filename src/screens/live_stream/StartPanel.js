import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from './styles';
import GStyles from '../../utils/Global/Styles';
import { GStyle } from '../../utils/Global';
import ScrollableTabView, {
  DefaultTabBar,
} from 'react-native-scrollable-tab-view';
import PanelLive from './PanelLive';

const StartPanel = ({ onPressStart, liveStatus, onPressClose }) => {
  return (
    <View style={styles.wrapperStartPanel}>
      <ScrollableTabView
        initialPage={0}
        tabBarPosition="overlayBottom"
        tabBarBackgroundColor={'transparent'}
        tabBarTextStyle={styles.tabBarTextStyle}
        tabBarInactiveTextColor={'white'}
        tabBarActiveTextColor={GStyle.activeColor}
        tabBarUnderlineStyle={{ backgroundColor: 'transparent' }}
        renderTabBar={() => (
          <DefaultTabBar
            style={{
              borderWidth: 0,
              backgroundColor: 'white',
            }}
          />
        )}
      >
        <PanelLive
          tabLabel="Video Live"
          onPressStart={onPressStart}
          liveStatus={liveStatus}
          mode={0}
          onPressClose={onPressClose}
        />
        <PanelLive
          tabLabel="Audio Live"
          onPressStart={onPressStart}
          liveStatus={liveStatus}
          mode={1}
          onPressClose={onPressClose}
        />
      </ScrollableTabView>
    </View>
  );
};

const style = StyleSheet.create({
  container: {},
});

export default StartPanel;
