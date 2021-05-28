import React from 'react';
import {
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  StackActions,
} from '@react-navigation/native';

import { connect } from 'react-redux';
import { setKeyword } from '../../redux/home/actions';

import ScrollableTabView, { DefaultTabBar } from 'rn-collapsing-tab-bar';

import { GStyle, GStyles, Helper } from '../../utils/Global/index';
import SearchBarItem from '../../components/elements/SearchBarItem';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';

import HomeVideoSearch from './HomeVideoSearch';
import HomeUsersScreen from './HomeUsersScreen';

const ic_back = require('../../assets/images/Icons/ic_back.png');

class HomeSearchScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('HomeSearchScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  init = () => {
    this.state = {
      isFetching: false,
      totalCount: 0,

      searchText: '',
      itemDatas: [],
    };

    this._isMounted = false;
  };

  onBack = () => {
    this.props.navigation.goBack();
  };

  onChangeSearchText = (text) => {
    const { searchText } = this.state;

    if (searchText.length < 1 && text.length > 1) {
      return;
    }

    const lastTyped = text.charAt(text.length - 1);
    const parseWhen = [',', ' ', ';', '\n'];

    if (text.length == 1) {
      if (parseWhen.indexOf(text.charAt(0)) > -1) {
        return;
      }
    }
    if (text.length > 1) {
      if (
        parseWhen.indexOf(text.charAt(text.length - 1)) > -1 &&
        parseWhen.indexOf(text.charAt(text.length - 2)) > -1
      ) {
        return;
      }
    }

    this.setState({ searchText: text });
  };

  onSubmitSearchText = () => {
    Keyboard.dismiss();

    if (this.usersListRef) {
      this.usersListRef.scrollToTop();
    }
    if (this.videosListRef) {
      this.videosListRef.scrollToTop();
    }

    const { searchText } = this.state;

    const lastTyped = searchText.charAt(searchText.length - 1);
    const parseWhen = [',', ' ', ';', '\n'];

    let keyword = '';
    if (searchText.length > 0) {
      if (parseWhen.indexOf(lastTyped) > -1) {
        keyword = searchText.slice(0, searchText.length - 1);
      } else {
        keyword = searchText;
      }
    } else {
      keyword = '';
    }

    this.setState({ searchText: '' });
    if (keyword == '') {
      return;
    }

    this.props.setKeyword(keyword);
  };

  render() {
    return (
      <>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          {this._renderSearch()}
          {this._renderTab()}
        </SafeAreaView>
      </>
    );
  }

  _renderSearch = () => {
    const { searchText } = this.state;

    return (
      <View style={{ flexDirection: 'row', padding: 16 }}>
        <TouchableOpacity onPress={this.onBack} style={GStyles.centerAlign}>
          <Image
            source={ic_back}
            style={{ width: 18, height: 18 }}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
        <View style={{ flex: 1, marginVertical: 4, marginHorizontal: 8 }}>
          <SearchBarItem
            searchText={searchText}
            onChangeText={this.onChangeSearchText}
            onSubmitText={this.onSubmitSearchText}
          />
        </View>
        {searchText !== '' && (
          <View style={{ ...GStyles.centerAlign, marginRight: 12 }}>
            <TouchableNativeFeedback
              onPress={this.onSubmitSearchText}
              style={{ ...GStyles.centerAlign, height: 50 }}
            >
              <Text style={{ ...GStyles.regularText, color: 'red' }}>
                Search
              </Text>
            </TouchableNativeFeedback>
          </View>
        )}
      </View>
    );
  };

  _renderTab = () => {
    const { keyword } = this.props;

    return (
      <ScrollableTabView
        ref={(ref) => {
          this.scrollTabView = ref;
        }}
        initialPage={0}
        tabBarBackgroundColor={GStyle.snowColor}
        tabBarActiveTextColor={GStyle.activeColor}
        tabBarUnderlineStyle={{ backgroundColor: GStyle.activeColor }}
        renderTabBar={() => (
          <DefaultTabBar
            inactiveTextColor={GStyle.fontColor}
            activeTextColor={GStyle.fontColor}
            backgroundColor={GStyle.grayBackColor}
          />
        )}
      >
        <HomeVideoSearch
          tabLabel="Videos"
          ref={(ref) => {
            this.videosListRef = ref;
          }}
          keyword={keyword}
          isQuickSearch={false}
        />
        <HomeUsersScreen
          tabLabel="Users"
          ref={(ref) => {
            this.usersListRef = ref;
          }}
          keyword={keyword}
        />
      </ScrollableTabView>
    );
  };
}

const styles = StyleSheet.create({});

const THomeSearchScreen = function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return <HomeSearchScreen {...props} navigation={navigation} route={route} />;
};
export default connect(
  (state) => ({
    keyword: state.home.keyword,
  }),
  { setKeyword },
)(THomeSearchScreen);
