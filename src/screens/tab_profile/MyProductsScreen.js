import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  NavigationContext,
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { connect } from 'react-redux';
import { setMyPostCount } from '../../redux/me/actions';
import RBSheet from 'react-native-raw-bottom-sheet';

import {
  Constants,
  GStyle,
  GStyles,
  Helper,
  RestAPI,
} from '../../utils/Global';
import GHeaderBar from '../../components/GHeaderBar';
import ProductsList from '../../components/elements/ProductsList';

class MyProductsScreen extends React.Component {
  static contextType = NavigationContext;

  constructor(props) {
    super(props);

    console.log('MyProductsScreen start');

    this.init();
  }

  componentDidMount() {

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('profile'));
    });
    this.onRefresh('init');
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  init = () => {
    this.state = {
      itemDatas: [],
      totalCount: 0,
      curPage: 1,
      isFetching: false,
      onEndReachedDuringMomentum: true,
    };

    this._selItem = null;
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
      //showForcePageLoader(true);
    } else {
      this.setState({ isFetching: true });
    }

    let params = {
      user_id: global.me ? global.me?.id : '',
      me_id: global.me ? global.me?.id : '',
      page_number: type === 'more' ? curPage : '1',
      count_per_page: Constants.COUNT_PER_PAGE,
    };
    //showForcePageLoader(true);
    RestAPI.get_user_video_list(params, (json, err) => {
      if (type === 'init') {
        showForcePageLoader(false);
      } else {
        this.setState({ isFetching: false });
      }

      if (err !== null) {
        Helper.alertNetworkError(err?.message);
      } else {
        if (json.status === 200) {
          this.setState({ totalCount: json.data.totalCount });
          if (type === 'more') {
            let data = itemDatas.concat(json.data.videoList);
            this.setState({ itemDatas: data });
          } else {
            this.setState({ itemDatas: json.data.videoList });
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
    global._profileMyVideoDatas = itemDatas;
    global._prevScreen = 'profile_my_video';
    const pushAction = StackActions.push('profile_video', null);
    this.props.navigation.dispatch(pushAction);
  };

  onLongPressVideo = (item) => {
    this._selItem = item;
    this.bottomMenu?.open();
  };

  onPressOutStock = () => {
    const { itemDatas } = this.state;

    this._selItem.sticker = 1;
    this.bottomMenu.close();
    this.setState({ itemDatas });

    this.updateVideoSticker();
  };

  onPressSpecialOffer = () => {
    const { itemDatas } = this.state;

    this._selItem.sticker = 2;
    this.bottomMenu.close();
    this.setState({ itemDatas });

    this.updateVideoSticker();
  };

  onPressFreeDelivery = () => {
    const { itemDatas } = this.state;

    this._selItem.sticker = 3;
    this.bottomMenu.close();
    this.setState({ itemDatas });

    this.updateVideoSticker();
  };

  onPressNoSticker = () => {
    const { itemDatas } = this.state;

    this._selItem.sticker = 0;
    this.bottomMenu.close();
    this.setState({ itemDatas });

    this.updateVideoSticker();
  };

  onPressNewProduct = () => {
    global._prevScreen = 'my_products';
    this.props.navigation.navigate('camera_main');
  };

  updateVideoSticker = () => {
    let params = {
      video_id: this._selItem.id,
      sticker: this._selItem.sticker,
    };
    RestAPI.update_video_sticker(params, (json, err) => {});
  };

  _renderBottomMenu = () => (
    <View style={{ width: '100%' }}>
      <TouchableOpacity
        onPress={this.onPressOutStock}
        style={{ ...styles.panelButton }}
      >
        <Text style={styles.panelButtonTitle}>Out of stock</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={this.onPressSpecialOffer}
        style={styles.panelButton}
      >
        <Text style={styles.panelButtonTitle}>Special offer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={this.onPressFreeDelivery}
        style={styles.panelButton}
      >
        <Text style={styles.panelButtonTitle}>Free delivery</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={this.onPressNoSticker}
        style={styles.panelButton}
      >
        <Text style={styles.panelButtonTitle}>No Sticker</Text>
      </TouchableOpacity>
    </View>
  );

  setOnEndReachedDuringMomentum = (onEndReachedDuringMomentum) => {
    this.setState({
      onEndReachedDuringMomentum,
    });
  };

  _renderVideo = () => {
    const { isFetching, itemDatas, onEndReachedDuringMomentum } = this.state;
    return (
      <View style={{ flex: 1, width: '100%' }}>
        <ProductsList
          products={itemDatas}
          ref={(ref) => {
            this.flatListRef = ref;
          }}
          onRefresh={this.onRefresh}
          isFetching={isFetching}
          onPressVideo={this.onPressVideo}
          onLongPressVideo={this.onLongPressVideo}
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
          headerTitle="My Products"
          leftType="back"
          navigation={navigation}
          rightAvatar={
            <TouchableOpacity onPress={this.onPressNewProduct}>
              <Text
                style={[
                  GStyles.textSmall,
                  GStyles.boldText,
                  { color: 'black' },
                ]}
              >
                Add New
              </Text>
            </TouchableOpacity>
          }
        />
        {this._renderVideo()}
        <RBSheet
          ref={(ref) => {
            this.bottomMenu = ref;
          }}
          height={200}
          closeOnDragDown
          openDuration={250}
          customStyles={{
            container: {
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            },
          }}
        >
          <View
            style={{
              ...GStyles.rowContainer,
              justifyContent: 'space-around',
            }}
          >
            {this._renderBottomMenu()}
          </View>
        </RBSheet>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  panelButton: {
    width: '100%',
    height: 36,
    backgroundColor: GStyle.grayBackColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 1,
  },
  panelButtonTitle: {
    fontSize: 14,
  },
});

const TProfileMyVideoScreen = (props) => {
  let navigation = useNavigation();
  let route = useRoute();
  return <MyProductsScreen {...props} navigation={navigation} route={route} />;
};

export default connect((state) => ({}), { setMyPostCount })(
  TProfileMyVideoScreen,
);
