import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

import { connect } from 'react-redux';
import { setSavedCount } from '../../redux/me/actions';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Constants, GStyles, Helper, RestAPI } from '../../utils/Global/index';
import GHeaderBar from '../../components/GHeaderBar';


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
  };

  onRefresh = () => {
    let params = {
      user_id: global.me.id,
      page_number: '1',
      count_per_page: '1000',
    };
    showPageLoader(true);
    RestAPI.get_liked_video_list(params, (json, err) => {
      showPageLoader(false);

      if (err !== null) {
        Helper.alertNetworkError(err?.message);
      } else {
        if (json.status === 200) {
          if (this._isMounted) {
            this.setState({ itemDatas: json?.data?.videoList });
            this.props.setSavedCount(json?.data?.videoList?.length);
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
    global._profileLikedVideoDatas = itemDatas;
    global._prevScreen = 'profile_liked_video';
    const pushAction = StackActions.push('profile_video', null);
    this.props.navigation.dispatch(pushAction);
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
          <View
              style={{
                width: '88%',
                height: '100%',
              }}
          >
            {this._renderVideo()}
          </View>
        </SafeAreaView>
    );
  }

  _renderVideo = () => {
    const { itemDatas } = this.state;

    console.log(itemDatas);
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginVertical: 40,
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
                marginTop: 2,
              }}
            >
              <Text
                style={{
                  ...GStyles.regularText,
                  color: 'black',
                }}
              >
                {item.left_days || 30} days left
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.onPressVideo(item.id);
                }}
                style={{ marginTop: 2 }}
              >
                <FastImage
                  source={{
                    uri: item.thumb || '',
                    priority: FastImage.priority.normal,
                  }}
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

const styles = StyleSheet.create({});

const TProfileLikedVideoScreen = (props) => {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <SavedProductsScreen {...props} navigation={navigation} route={route} />
  );
};

export default connect((state) => ({}), {setSavedCount})(
  TProfileLikedVideoScreen,
);
