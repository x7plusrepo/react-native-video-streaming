import React from 'react';
import { SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScrollableTabView, {
  ScrollableTabBar,
} from 'react-native-scrollable-tab-view';
import LiveStreamRooms from './LiveStreamRooms';

import { GStyle, Helper } from '../../utils/Global/index';

class BrowseRooms extends React.Component {
  constructor(props) {
    super(props);
    console.log('BrowseRooms start');
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('liveStream'));
      Helper.setLightStatusBar();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();

    this._isMounted = false;
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollableTabView
          initialPage={0}
          tabBarBackgroundColor={GStyle.snowColor}
          tabBarActiveTextColor={GStyle.lightBlueColor}
          tabBarUnderlineStyle={{ backgroundColor: 'transparent' }}
          renderTabBar={() => <ScrollableTabBar />}
        >
          <LiveStreamRooms tabLabel="Popular" quickKeyword={'popular'} />
          <LiveStreamRooms tabLabel="NearBy" quickKeyword={'nearby'} />
        </ScrollableTabView>
      </SafeAreaView>
    );
  }
}

const THomeMainScreen = (props) => {
  let navigation = useNavigation();
  let route = useRoute();
  return <BrowseRooms {...props} navigation={navigation} route={route} />;
};
export default THomeMainScreen;
