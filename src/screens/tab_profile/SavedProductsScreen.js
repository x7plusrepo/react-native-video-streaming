import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import {
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { connect } from 'react-redux';
import { setSavedCount } from '../../redux/me/actions';
import { Constants, GStyles, Helper, RestAPI } from '../../utils/Global';
import GHeaderBar from '../../components/GHeaderBar';
import ProductsList from '../../components/elements/ProductsList';

const WINDOW_WIDTH = Helper.getWindowWidth();
const CELL_WIDTH = (WINDOW_WIDTH * 0.88) / 3.0 - 3;

class SavedProductsScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('SavedProductsScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('profile'));
    });
    this.onRefresh('init');
  }

  componentWillUnmount() {
    this.unsubscribe();

    this._isMounted = false;
  }

  init = () => {
    this.state = {
      itemDatas: [],
      totalCount: 0,
      curPage: 1,
      isFetching: false,
      onEndReachedDuringMomentum: true,
    };

    this._isMounted = false;
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
    this.setState({ curPage });
    if (type === 'init') {
      showForcePageLoader(true);
    } else {
      this.setState({ isFetching: true });
    }

    let params = {
      user_id: global.me ? global.me?.id : '',
      page_number: type === 'more' ? curPage : '1',
      count_per_page: Constants.COUNT_PER_PAGE,
    };
    RestAPI.get_liked_video_list(params, (json, err) => {
      if (type === 'init') {
        showForcePageLoader(false);
      } else {
        if (this._isMounted) {
          this.setState({ isFetching: false });
        }
      }

      if (err !== null) {
        Helper.alertNetworkError(err?.message);
      } else {
        if (json.status === 200) {
          if (this._isMounted) {
            this.setState({ totalCount: json.data.totalCount });
            if (type === 'more') {
              let data = itemDatas.concat(json.data.videoList);
              this.setState({ itemDatas: data });
            } else {
              this.setState({ itemDatas: json.data.videoList });
            }
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onPressVideo = (item) => {
    const { itemDatas } = this.state;
    global._selIndex = itemDatas.findIndex((obj) => obj.id === item.id);
    global._profileLikedVideoDatas = itemDatas;
    global._prevScreen = 'profile_liked_video';
    const pushAction = StackActions.push('profile_video', null);
    this.props.navigation.dispatch(pushAction);
  };

  setOnEndReachedDuringMomentum = (onEndReachedDuringMomentum) => {
    this.setState({
      onEndReachedDuringMomentum,
    });
  };

  _renderVideo = () => {
    const { isFetching, itemDatas, onEndReachedDuringMomentum } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <ProductsList
          products={itemDatas}
          ref={(ref) => {
            this.flatListRef = ref;
          }}
          onRefresh={this.onRefresh}
          isFetching={isFetching}
          onPressVideo={this.onPressVideo}
          onEndReachedDuringMomentum={onEndReachedDuringMomentum}
          setOnEndReachedDuringMomentum={this.setOnEndReachedDuringMomentum}
        />
      </View>
    );
  };

  render() {
    const { navigation } = this.props;

    return (
      <SafeAreaView style={GStyles.container}>
        <GHeaderBar
          headerTitle="Saved Products"
          leftType="back"
          navigation={navigation}
        />
        {this._renderVideo()}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({});

const TProfileLikedVideoScreen = (props) => {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <SavedProductsScreen {...props} navigation={navigation} route={route} />
  );
};

export default connect((state) => ({}), { setSavedCount })(
  TProfileLikedVideoScreen,
);
