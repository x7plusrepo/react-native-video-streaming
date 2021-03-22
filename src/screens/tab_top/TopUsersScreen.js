import React, {useState, useRef, forwardRef} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Button,
  Dimensions,
  FlatList,
  Image,
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
import {useNavigation, useRoute} from '@react-navigation/native';

import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
  RestAPI,
} from '../../utils/Global/index';
import GHeaderBar from '../../components/GHeaderBar';
import TopUserItem from '../../components/elements/TopUserItem';

const FLATLIST_WIDTH = Helper.getContentWidth();

class TopUsersScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('TopUsersScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('top'));
      Helper.setLightStatusBar();

      this.onRefresh('init');
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  init = () => {
    this.state = {
      isFetching: false,
      totalCount: 0,
      curPage: 1,

      itemDatas: [],
    };
  };

  onRefresh = (type) => {
    let {isFetching, totalCount, curPage, itemDatas} = this.state;

    if (isFetching) {
      return;
    }

    if (type == 'more') {
      curPage += 1;
      const maxPage =
        (totalCount + Constants.COUNT_PER_PAGE - 1) / Constants.COUNT_PER_PAGE;
      if (curPage > maxPage) {
        return;
      }
    } else {
      curPage = 1;
    }
    this.setState({curPage});

    if (type == 'init') {
      showPageLoader(true);
    } else {
      this.setState({isFetching: true});
    }
    let params = {
      page_number: type == 'more' ? curPage : '1',
      count_per_page: Constants.COUNT_PER_PAGE,
    };
    RestAPI.get_top_user_list(params, (json, err) => {
      if (type == 'init') {
        showPageLoader(false);
      } else {
        this.setState({isFetching: false});
      }

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 1) {
          this.setState({totalCount: json.data.total_count});
          if (type == 'more') {
            let data = itemDatas.concat(json.data.user_list);
            this.setState({itemDatas: data});
          } else {
            this.setState({itemDatas: json.data.user_list});
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onPressUser = (item) => {
    if (global.me) {
      if (item.id == global.me.id) {
        this.props.navigation.navigate('profile');
      } else {
        global._opponentId = item.id;
        global._opponentName = item.user_name;
        global._opponentPhoto = item.user_photo;
        this.props.navigation.navigate('profile_other');
      }
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  scrollToTop = () => {
    this.flatListRef.scrollToOffset({animated: false, offset: 0});
  };

  onLogo = () => {};

  render() {
    return (
      <>
        <SafeAreaView style={GStyles.statusBar} />
        <SafeAreaView style={GStyles.container}>
          {this._renderHeader()}
          <View
            style={{
              flex: 1,
              width: '100%',
              backgroundColor: 'white',
            }}>
            {this._renderUserList()}
          </View>
        </SafeAreaView>
      </>
    );
  }

  _renderHeader = () => {
    return (
      <GHeaderBar
        headerTitle="Top users"
        leftType="logo"
        onPressLeftButton={this.onLogo}
      />
    );
  };

  _renderUserList = () => {
    const {isFetching, itemDatas} = this.state;

    return (
      <FlatList
        ref={(ref) => {
          this.flatListRef = ref;
        }}
        showsVerticalScrollIndicator={false}
        onRefresh={() => {
          this.onRefresh('pull');
        }}
        refreshing={isFetching}
        ListFooterComponent={this._renderFooter}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          this.onRefresh('more');
        }}
        data={itemDatas}
        renderItem={this._renderItem}
        keyExtractor={(item) => item.id}
      />
    );
  };

  _renderFooter = () => {
    const {isFetching} = this.state;

    if (!isFetching) return null;
    return <ActivityIndicator style={{color: '#000'}} />;
  };

  _renderItem = ({item, index}) => {
    return <TopUserItem index={index} item={item} onPress={this.onPressUser} />;
  };
}

const styles = StyleSheet.create({});

export default forwardRef((props, ref) => {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <TopUsersScreen
      {...props}
      ref={ref}
      navigation={navigation}
      route={route}
    />
  );
});
