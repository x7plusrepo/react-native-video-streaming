import React from 'react';
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
import MessageRoomItem from '../../components/elements/MessageRoomItem';

class MessageMainScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('MessageMainScreen start');

    this.init();
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('message'));
      Helper.setLightStatusBar();
      this.onRefresh('init');
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.unreadCount !== this.props.unreadCount) {
      this.onRefresh('update');
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
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
    if (type == 'init') {
      Helper.callFunc(global.onSetUnreadCount);
    }
    this.setState({curPage});

    if (type == 'init' || type == 'update') {
      showPageLoader(true);
    } else {
      this.setState({isFetching: true});
    }
    let params = {
      user_id: global.me.id,
      page_number: type == 'more' ? curPage : '1',
      count_per_page: Constants.COUNT_PER_PAGE,
    };
    RestAPI.get_room_list(params, (json, err) => {
      if (type == 'init' || type == 'update') {
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
            let data = itemDatas.concat(json.data.room_list);
            this.setState({itemDatas: data});
          } else {
            this.setState({itemDatas: json.data.room_list});
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onLogo = () => {
    console.log('---');
  };

  onPressRoom = (value) => {
    let params = {
      user_id: global.me.id,
      other_id: value.opponent_id,
    };
    RestAPI.set_read_status(params, (json, err) => {});

    global._roomId = value.opponent_id;
    global._opponentName = value.opponent_name;
    this.props.navigation.navigate('message_chat');
  };

  render() {
    return (
      <>
        <SafeAreaView style={GStyles.statusBar} />
        <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
          {this._renderHeader()}
          {this._renderRooms()}
        </SafeAreaView>
      </>
    );
  }

  _renderHeader = () => {
    return (
      <GHeaderBar
        headerTitle="Messages"
        leftType="logo"
        onPressLeftButton={this.onLogo}
      />
    );
  };

  _renderRooms = () => {
    const {isFetching, itemDatas} = this.state;

    return (
      <FlatList
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
        keyExtractor={(item) => item.opponent_id.toString()}
      />
    );
  };

  _renderFooter = () => {
    const {isFetching} = this.state;

    if (!isFetching) return null;
    return <ActivityIndicator style={{color: '#000'}} />;
  };

  _renderItem = ({item}) => {
    return <MessageRoomItem item={item} onPress={this.onPressRoom} />;
  };
}

const styles = StyleSheet.create({});

TMessageMainScreen = function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return <MessageMainScreen {...props} navigation={navigation} route={route} />;
};
export default connect(
  (state) => ({
    unreadCount: state.Message.unreadCount,
  }),
  {},
)(TMessageMainScreen);
