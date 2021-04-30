import React from 'react';
import { SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScrollableTabView, {
  ScrollableTabBar,
  DefaultTabBar,
} from 'react-native-scrollable-tab-view';
import LiveStreamRooms from './LiveStreamRooms';

import { GStyle, Helper } from '../../utils/Global/index';
import styles from './styles';

class BrowseRooms extends React.Component {
  constructor(props) {
    super(props);
    console.log('BrowseRooms start');
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white', paddingTop: 16 }}>
        <ScrollableTabView
          initialPage={0}
          tabBarBackgroundColor='white'
          tabBarTextStyle={styles.tabBarTextStyle}
          tabBarInactiveTextColor={'black'}
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
          <LiveStreamRooms tabLabel="Popular" keyword={'popular'} />
          <LiveStreamRooms tabLabel="NearBy" keyword={'nearby'} />
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
