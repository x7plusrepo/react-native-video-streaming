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

import {connect} from 'react-redux';
import {setKeyword} from '../../redux/home/actions';

import {useNavigation, useRoute, StackActions} from '@react-navigation/native';
import ScrollableTabView, {
  ScrollableTabBar,
  DefaultTabBar,
} from 'react-native-scrollable-tab-view';

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

const image_search = require('../../assets/images/ic_search.png');
const ic_back = require('../../assets/images/ic_back.png');

class HomeMainScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('HomeMainScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('home'));
      Helper.setLightStatusBar();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();

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

  onChangeSearchText = (text) => {
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
    // if (this.videoListRef) {
    //   this.videoListRef.scrollToTop();
    // }

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
    this.props.navigation.navigate('home_search');
  };

  render() {
    const {keyword} = this.props;

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        {this._renderSearch()}
        <ScrollableTabView
          initialPage={0}
          tabBarBackgroundColor={GStyle.snowColor}
          tabBarActiveTextColor={GStyle.activeColor}
          tabBarUnderlineStyle={{backgroundColor: GStyle.activeColor}}
          renderTabBar={() => <ScrollableTabBar />}>
          <HomeVideoScreen
            tabLabel="Gifts"
            quickKeyword={'gift,gifts'}
            isQuickSearch={true}
          />
          <HomeVideoScreen
            tabLabel="Women"
            quickKeyword={'woman,women'}
            isQuickSearch={true}
          />
          <HomeVideoScreen
            tabLabel="Men"
            quickKeyword={'man,men'}
            isQuickSearch={true}
          />
          <HomeVideoScreen
            tabLabel="Boys"
            quickKeyword={'boy,boys'}
            isQuickSearch={true}
          />
          <HomeVideoScreen
            tabLabel="Girls"
            quickKeyword={'girl,girls'}
            isQuickSearch={true}
          />
          <HomeVideoScreen
            tabLabel="Baby"
            quickKeyword={'baby'}
            isQuickSearch={true}
          />
          <HomeVideoScreen
            tabLabel="Toys"
            quickKeyword={'toy,toys'}
            isQuickSearch={true}
          />
          <HomeVideoScreen
            tabLabel="Home"
            quickKeyword={'home'}
            isQuickSearch={true}
          />
          <HomeVideoScreen
            tabLabel="Kitchen"
            quickKeyword={'kitchen'}
            isQuickSearch={true}
          />
          <HomeVideoScreen
            tabLabel="Electronics"
            quickKeyword={'electronic,electronics'}
            isQuickSearch={true}
          />
        </ScrollableTabView>
      </SafeAreaView>
    );
  }

  _renderSearch = () => {
    const {searchText} = this.state;

    return (
      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
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
}

const styles = StyleSheet.create({});

THomeMainScreen = function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return <HomeMainScreen {...props} navigation={navigation} route={route} />;
};
export default connect(
  (state) => ({
    keyword: state.Home.keyword,
  }),
  {setKeyword},
)(THomeMainScreen);
