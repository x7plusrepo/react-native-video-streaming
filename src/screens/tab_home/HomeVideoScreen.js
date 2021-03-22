import React, {useState, useRef, forwardRef} from 'react';
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

import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
  RestAPI,
} from '../../utils/Global/index';
import GHeaderBar from '../../components/GHeaderBar';
import ExploreVideoItem from '../../components/elements/ExploreVideoItem';
import SearchBarItem from '../../components/elements/SearchBarItem';
import {TouchableNativeFeedback} from 'react-native-gesture-handler';
import {forEach} from 'underscore';

const ic_back = require('../../assets/images/ic_back.png');

class HomeVideoScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('HomeVideoScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;

    this.onRefresh('init');
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.keyword) {
      if (prevProps.keyword !== this.props.keyword) {
        this.setState({keyword: this.props.keyword}, () => {
          this.onRefresh('init');
        });
      }
    }
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

      minVisibleIndex: 0,
      maxVisibleIndex: 0,
    };

    this._isMounted = false;
  };

  onRefresh = (type) => {
    let {isFetching, totalCount, curPage, itemDatas} = this.state;
    const {keyword, quickKeyword, isQuickSearch} = this.props;

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

    let funcGetVideoList = null;
    let searchText = null;
    if (isQuickSearch) {
      funcGetVideoList = RestAPI.get_quick_search_video_list;
      searchText = quickKeyword;
    } else {
      funcGetVideoList = RestAPI.get_filtered_video_list;
      searchText = keyword;
    }

    if (type == 'init') {
      showPageLoader(true);
    } else {
      this.setState({isFetching: true});
    }
    let params = {
      user_id: global.me ? global.me.id : '0',
      page_number: type == 'more' ? curPage : '1',
      count_per_page: Constants.COUNT_PER_PAGE,
      keyword: searchText,
    };
    funcGetVideoList(params, (json, err) => {
      if (type == 'init') {
        showPageLoader(false);
      } else {
        if (this._isMounted) {
          this.setState({isFetching: false});
        }
      }

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 1) {
          if (this._isMounted) {
            this.setState({totalCount: json.data.total_count});
            if (type == 'more') {
              let data = itemDatas.concat(json.data.video_list);
              this.setState({itemDatas: data});
            } else {
              this.setState({itemDatas: json.data.video_list});
            }
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onPressVideo = (value) => {
    const {itemDatas, curPage, totalCount} = this.state;
    const {keyword} = this.props;

    const selIndex = itemDatas.findIndex((obj) => obj.id === value);
    // let newAfterItemDatas = itemDatas.slice(selIndex);
    // let newBeforeItemDatas = itemDatas.slice(0, selIndex);
    // global._myVideoDatas = [...newAfterItemDatas, ...newBeforeItemDatas];

    global._curPage = curPage;
    global._totalCount = totalCount;
    global._keyword = keyword;
    global._selIndex = selIndex;
    global._exploreMainVideoDatas = itemDatas;
    global._prevScreen = 'home_main_video';

    // this.props.navigation.navigate('profile_video');
    const pushAction = StackActions.push('profile_video', null);
    this.props.navigation.dispatch(pushAction);
  };

  onViewableItemsChanged = ({viewableItems, changed}) => {
    let minVisibleIndex = 0;
    let maxVisibleIndex = 0;
    if (viewableItems.length > 0) {
      // For arrays with tens of thousands of items:
      minVisibleIndex = viewableItems[0].index;
      maxVisibleIndex = viewableItems[0].index;

      for (const item of viewableItems) {
        if (item.index < minVisibleIndex) {
          minVisibleIndex = item.index;
        }
        if (item.index > maxVisibleIndex) {
          maxVisibleIndex = item.index;
        }
      }

      this.setState({minVisibleIndex, maxVisibleIndex});
    }
  };

  scrollToTop = () => {
    this.flatListRef.scrollToOffset({animated: false, offset: 0});
  };

  render() {
    return (
      <>
        <View style={{flex: 1, backgroundColor: 'white'}}>
          {this._renderVideo()}
        </View>
      </>
    );
  }

  _renderVideo = () => {
    const {isFetching, itemDatas} = this.state;

    return (
      <FlatList
        ref={(ref) => {
          this.flatListRef = ref;
        }}
        showsVerticalScrollIndicator={false}
        numColumns={2}
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

    if (!isFetching) {
      return null;
    }

    return <ActivityIndicator style={{color: '#000'}} />;
  };

  _renderItem = ({item, index}) => {
    return <ExploreVideoItem item={item} onPress={this.onPressVideo} />;
  };
}

const styles = StyleSheet.create({});

THomeVideoScreen = connect(
  (state) => ({
    keyword: state.Home.keyword,
  }),
  {},
)(HomeVideoScreen);

export default forwardRef((props, ref) => {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <HomeVideoScreen
      {...props}
      ref={ref}
      navigation={navigation}
      route={route}
    />
  );
});
