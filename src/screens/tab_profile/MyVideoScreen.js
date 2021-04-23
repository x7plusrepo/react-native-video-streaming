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
import FastImage from 'react-native-fast-image';
import RBSheet from 'react-native-raw-bottom-sheet';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {
  Constants,
  GStyle,
  GStyles,
  Helper,
  RestAPI,
} from '../../utils/Global/index';
import GHeaderBar from '../../components/GHeaderBar';

const WINDOW_WIDTH = Helper.getWindowWidth();
const CELL_WIDTH = (WINDOW_WIDTH * 0.88) / 3.0 - 3;

class MyVideoScreen extends React.Component {
  static contextType = NavigationContext;

  constructor(props) {
    super(props);

    console.log('MyVideoScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.onRefresh();
      Helper.callFunc(global.setBottomTabName('profile'));
    });
  }

  componentWillUnmount() {
    this.unsubscribe();

    this._isMounted = false;
  }

  init = () => {
    this.state = {
      itemDatas: [],
    };

    this._isMounted = false;
    this._selItem = null;
  };

  onRefresh = () => {
    let params = {
      user_id: global.me.id,
      page_number: '1',
      count_per_page: '1000',
    };
    showPageLoader(true);
    RestAPI.get_user_video_list(params, (json, err) => {
      showPageLoader(false);

      if (err !== null) {
        Helper.alertNetworkError(err?.message);
      } else {
        if (json.status === 200) {
          if (this._isMounted) {
            this.setState({ itemDatas: json.data.videoList });
            this.props.setMyPostCount(json.data.videoList.length);
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onPressVideo = (value) => {
    const { itemDatas } = this.state;
    global._selIndex = itemDatas.findIndex((obj) => obj.id === value);
    global._profileMyVideoDatas = itemDatas;
    global._prevScreen = 'profile_my_video';
    const pushAction = StackActions.push('profile_video', null);
    this.props.navigation.dispatch(pushAction);
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

  updateVideoSticker = () => {
    let params = {
      video_id: this._selItem.id,
      sticker: this._selItem.sticker,
    };
    RestAPI.update_video_sticker(params, (json, err) => {});
  };

  render() {
    const { navigation } = this.props;
    return (
      <SafeAreaView style={GStyles.container}>
        <GHeaderBar
          headerTitle="My Posts"
          leftType="back"
          navigation={navigation}
        />
        <View
          style={{
            width: '88%',
            height: '100%',
          }}
        >
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
        </View>
      </SafeAreaView>
    );
  }

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

  _renderVideo = () => {
    const { itemDatas } = this.state;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginVertical: 50,
        }}
      >
        {itemDatas.map((item, i) => {
          return (
            <View
              key={i}
              style={{
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'white',
              }}
            >
              <View
                style={{
                  ...GStyles.centerAlign,
                  width: 52,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: 'lightgray',
                  marginVertical: 4,
                }}
              >
                <Text style={{ ...GStyles.mediumText }}>{item.number}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.onPressVideo(item.id);
                }}
                onLongPress={() => {
                  this._selItem = item;
                  this.bottomMenu.open();
                }}
              >
                <FastImage
                  source={{ uri: item.thumb || '' }}
                  resizeMode={FastImage.resizeMode.stretch}
                  style={{
                    width: CELL_WIDTH,
                    height: 120,
                  }}
                />
                <View
                  style={{
                    ...GStyles.rowContainer,
                    position: 'absolute',
                    right: 12,
                    bottom: 32,
                  }}
                >
                  <Text
                    style={{
                      ...GStyles.regularText,
                      fontSize: 10,
                      color: 'black',
                      backgroundColor:
                        item.sticker > 0 ? 'white' : 'transparent',
                      padding: 2,
                    }}
                  >
                    {Constants.STICKER_NAME_LIST[Number(item.sticker)]}
                  </Text>
                </View>
                <View
                  style={{
                    ...GStyles.rowContainer,
                    position: 'absolute',
                    right: 12,
                    bottom: 12,
                    backgroundColor: 'white',
                    paddingVertical: 2,
                    paddingHorizontal: 4,
                  }}
                >
                  <FontAwesome
                    name="group"
                    style={{ fontSize: 16, color: 'black' }}
                  />
                  <Text
                    style={{
                      ...GStyles.regularText,
                      fontSize: 13,
                      color: 'black',
                      marginLeft: 4,
                    }}
                  >
                    {item.viewCount}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };
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
  return <MyVideoScreen {...props} navigation={navigation} route={route} />;
};

export default connect((state) => ({}), { setMyPostCount })(
  TProfileMyVideoScreen,
);
