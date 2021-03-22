import React from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Button,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {useNavigation, useRoute, StackActions} from '@react-navigation/native';

import {connect} from 'react-redux';
import {setKeyword} from '../../redux/home/actions';

import ScrollableTabView, {DefaultTabBar} from 'rn-collapsing-tab-bar';

import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
  RestAPI,
} from '../../utils/Global/index';
import GHeaderBar from '../../components/GHeaderBar';
import SearchBarItem from '../../components/elements/SearchBarItem';
import {TouchableNativeFeedback} from 'react-native-gesture-handler';

import HomeVideoScreen from './HomeVideoScreen';
import HomeUsersScreen from './HomeUsersScreen';

const ic_back = require('../../assets/images/ic_back.png');

const WINDOW_WIDTH = Helper.getWindowWidth();

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
    const {searchText} = this.state;

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

    this.setState({searchText: text});
  };

  onSubmitSearchText = () => {
    Keyboard.dismiss();

    if (this.usersListRef) {
      this.usersListRef.scrollToTop();
    }
    if (this.videosListRef) {
      this.videosListRef.scrollToTop();
    }

    const {searchText} = this.state;

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

    this.setState({searchText: ''});
    if (keyword == '') {
      return;
    }

    this.props.setKeyword(keyword);
  };

  render() {
    return (
      <>
        <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
          {this._renderSearch()}
          {this._renderTab()}
        </SafeAreaView>
      </>
    );
  }

  _renderSearch = () => {
    const {searchText} = this.state;

    return (
      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
        <View style={{justifyContent: 'center'}}>
          <TouchableOpacity
            onPress={this.onBack}
            style={{...GStyles.centerAlign, width: 40, height: 50}}>
            <Image
              source={ic_back}
              style={{width: 20, height: 14, marginLeft: 12}}></Image>
          </TouchableOpacity>
        </View>
        <View style={{flex: 1, marginVertical: 4, marginHorizontal: 8}}>
          <SearchBarItem
            searchText={searchText}
            onChangeText={this.onChangeSearchText}
            onSubmitText={this.onSubmitSearchText}
          />
        </View>
        {searchText != '' && (
          <View style={{...GStyles.centerAlign, marginRight: 12}}>
            <TouchableNativeFeedback
              onPress={this.onSubmitSearchText}
              style={{...GStyles.centerAlign, height: 50}}>
              <Text style={{...GStyles.regularText, color: 'red'}}>Search</Text>
            </TouchableNativeFeedback>
          </View>
        )}
      </View>
    );
  };

  _renderTab = () => {
    const {keyword} = this.props;

    return (
      <ScrollableTabView
        ref={(ref) => {
          this.scrollTabView = ref;
        }}
        initialPage={0}
        tabBarBackgroundColor={GStyle.snowColor}
        tabBarActiveTextColor={GStyle.activeColor}
        tabBarUnderlineStyle={{backgroundColor: GStyle.activeColor}}
        renderTabBar={() => (
          <DefaultTabBar
            inactiveTextColor={GStyle.fontColor}
            activeTextColor={GStyle.fontColor}
            backgroundColor={GStyle.grayBackColor}
          />
        )}>
        <HomeVideoScreen
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

THomeSearchScreen = function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return <HomeSearchScreen {...props} navigation={navigation} route={route} />;
};
export default connect(
  (state) => ({
    keyword: state.Home.keyword,
  }),
  {setKeyword},
)(THomeSearchScreen);
