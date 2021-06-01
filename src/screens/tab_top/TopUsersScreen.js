import React, { forwardRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
  RestAPI,
} from '../../utils/Global';
import GHeaderBar from '../../components/GHeaderBar';
import TopUserItem from '../../components/elements/TopUserItem';
import ic_chevron_right from '../../assets/images/Icons/ic_chevron_right.png';
import ic_bean from '../../assets/images/Icons/ic_bean.png';

const WINDOW_WIDTH = Helper.getWindowWidth();
const CELL_WIDTH = (WINDOW_WIDTH - 32 - 32) / 3.0;

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
    this.unsubscribe();
  }

  init = () => {
    this.state = {
      isFetching: false,
      totalCount: 0,
      curPage: 1,

      itemDatas: [],
      onEndReachedDuringMomentum: true,
    };
  };

  onRefresh = (type) => {
    let { isFetching, totalCount, curPage, itemDatas } = this.state;

    if (isFetching) {
      return;
    }

    if (type === 'more') {
      curPage += 1;
      const maxPage =
        (totalCount + Constants.COUNT_PER_PAGE - 1) / Constants.COUNT_PER_PAGE;
      if (curPage > maxPage) {
        return;
      }
    } else {
      curPage = 1;
    }
    this.setState({ curPage, onEndReachedDuringMomentum: true });

    if (type === 'init') {
      //showForcePageLoader(true);
    } else {
      this.setState({ isFetching: true });
    }
    let params = {
      page_number: type === 'more' ? curPage : '1',
      count_per_page: Constants.COUNT_PER_PAGE,
    };
    RestAPI.get_top_user_list(params, (json, err) => {
      if (type === 'init') {
        showForcePageLoader(false);
      } else {
        this.setState({ isFetching: false });
      }

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 200) {
          this.setState({ totalCount: json.data.totalCount });
          if (type === 'more') {
            let data = itemDatas.concat(json.data.userList);
            this.setState({ itemDatas: data });
          } else {
            this.setState({ itemDatas: json.data.userList });
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onPressUser = (item) => {
    if (global.me) {
      if (item.id === global.me.id) {
        this.props.navigation.navigate('profile');
      } else {
        global._opponentId = item.id;
        global._opponentName = item.username;
        global._opponentPhoto = item.photo;
        this.props.navigation.navigate('profile_other');
      }
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  scrollToTop = () => {
    this.flatListRef.scrollToOffset({ animated: false, offset: 0 });
  };

  onLogo = () => {};

  render() {
    return (
      <>
        <SafeAreaView style={GStyles.statusBar} />
        <SafeAreaView style={GStyles.container}>
          {this._renderHeader()}
          {this._renderStatistics()}
          {this._renderAboutRule()}
          {this._renderUserList()}
        </SafeAreaView>
      </>
    );
  }

  _renderAboutRule = () => {
    return (
      <TouchableOpacity style={[{ marginTop: 16 }, GStyles.rowCenterContainer]}>
        <Text
          style={[
            GStyles.regularText,
            GStyles.boldText,
            { color: GStyle.grayColor },
          ]}
        >
          About rules
        </Text>
        <Image
          source={ic_chevron_right}
          style={{ width: 12, height: 12 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  };

  _renderStatistics = () => {
    return (
      <View
        style={[
          GStyles.rowBetweenContainer,
          { width: '100%', paddingHorizontal: 16 },
        ]}
      >
        <View style={styles.statisticsWrapper}>
          <Text
            style={[GStyles.regularText, GStyles.boldText, { color: 'black' }]}
          >
            Today
          </Text>
          <View style={styles.statisticsItem}>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <Text
                style={[
                  GStyles.regularText,
                  GStyles.boldText,
                  { color: 'white' },
                ]}
              >
                X2
              </Text>
            </View>
          </View>
          <Text
            style={[GStyles.regularText, GStyles.boldText, { color: 'black' }]}
          >
            Today
          </Text>
        </View>
        <View style={styles.statisticsWrapper}>
          <Text
            style={[GStyles.regularText, GStyles.boldText, { color: 'black' }]}
          >
            Today
          </Text>
          <View style={styles.statisticsItem}>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <Text
                style={[
                  GStyles.regularText,
                  GStyles.boldText,
                  { color: 'white' },
                ]}
              >
                X2
              </Text>
            </View>
          </View>
          <Text
            style={[GStyles.regularText, GStyles.boldText, { color: 'black' }]}
          >
            Today
          </Text>
        </View>
        <View style={styles.statisticsWrapper}>
          <Text
            style={[GStyles.regularText, GStyles.boldText, { color: 'black' }]}
          >
            Today
          </Text>
          <View style={styles.statisticsItem}>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <Text
                style={[
                  GStyles.regularText,
                  GStyles.boldText,
                  { color: 'white' },
                ]}
              >
                X2
              </Text>
            </View>
          </View>
          <Text
            style={[GStyles.regularText, GStyles.boldText, { color: 'black' }]}
          >
            Today
          </Text>
        </View>
      </View>
    );
  };

  _renderHeader = () => {
    return (
      <GHeaderBar
        headerTitle="Top Rank"
        leftType="logo"
        onPressLeftButton={this.onLogo}
        rightAvatar={
          <TouchableOpacity>
            <Text style={[GStyles.regularText, GStyles.boldText]}>Global</Text>
          </TouchableOpacity>
        }
      />
    );
  };

  _renderUserList = () => {
    const { isFetching, itemDatas } = this.state;

    return (
      <View style={styles.listWrapper}>
        <View
          style={[
            GStyles.rowBetweenContainer,
            {
              borderBottomWidth: 0.5,
              borderBottomColor: GStyle.grayColor,
              paddingVertical: 8,
              paddingHorizontal: 16,
            },
          ]}
        >
          <View style={GStyles.rowCenterContainer}>
            <Text
              style={[
                GStyles.textSmall,
                GStyles.boldText,
                { color: GStyle.grayColor },
              ]}
            >
              Count Down:
            </Text>
            <Text
              style={[GStyles.textSmall, GStyles.boldText, { color: 'black' }]}
            >
              {' '}
              23:21
            </Text>
          </View>
          <View style={GStyles.rowCenterContainer}>
            <Text
              style={[
                GStyles.textSmall,
                GStyles.boldText,
                { color: GStyle.grayColor },
              ]}
            >
              You:{' '}
            </Text>
            <Image
              source={ic_bean}
              style={{ width: 12, height: 12 }}
              resizeMode="contain"
            />
          </View>
          <View style={GStyles.rowCenterContainer}>
            <Text
              style={[
                GStyles.textSmall,
                GStyles.boldText,
                { color: GStyle.grayColor },
              ]}
            >
              Rank:
            </Text>
            <Text
              style={[GStyles.textSmall, GStyles.boldText, { color: 'black' }]}
            >
              {' '}
              100+
            </Text>
          </View>
        </View>
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
          onMomentumScrollBegin={() => {
            this.setState({ onEndReachedDuringMomentum: false });
          }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (!this.state.onEndReachedDuringMomentum) {
              this.setState({ onEndReachedDuringMomentum: true });
              this.onRefresh('more');
            }
          }}
          data={[...itemDatas, ...itemDatas, ...itemDatas, ...itemDatas]}
          renderItem={this._renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  };

  _renderFooter = () => {
    const { isFetching } = this.state;

    if (!isFetching) return null;
    return <ActivityIndicator style={{ color: '#000' }} />;
  };

  _renderItem = ({ item, index }) => {
    return <TopUserItem index={index} item={item} onPress={this.onPressUser} />;
  };
}

const styles = StyleSheet.create({
  statisticsWrapper: {
    ...GStyles.centerAlign,
    marginTop: 24,
    width: CELL_WIDTH,
  },
  statisticsItem: {
    backgroundColor: GStyle.activeColor,
    borderRadius: 8,
    height: 84,
    marginVertical: 8,
    paddingVertical: 8,
    width: '100%',
  },
  listWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
  },
});

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
