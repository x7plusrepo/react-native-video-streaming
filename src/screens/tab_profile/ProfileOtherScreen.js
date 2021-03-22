import React from 'react';
import {
  Alert,
  BackHandler,
  Button,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {useNavigation, useRoute, StackActions} from '@react-navigation/native';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import FastImage from 'react-native-fast-image';
import SwitchSelector from 'react-native-switch-selector';

import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
  RestAPI,
} from '../../utils/Global/index';
import GHeaderBar from '../../components/GHeaderBar';
import Avatar from '../../components/elements/Avatar';

const ic_like = require('../../assets/images/ic_like.png');
const ic_dislike = require('../../assets/images/ic_dislike.png');
const ic_favorite = require('../../assets/images/ic_favorite.png');

const WINDOW_WIDTH = Helper.getWindowWidth();
const CELL_WIDTH = (WINDOW_WIDTH * 0.88) / 3.0 - 2;

class ProfileOtherScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('ProfileOtherScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('profile_other'));
      Helper.setLightStatusBar();
      this.onRefresh();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();

    this._isMounted = false;
  }

  init = () => {
    this.state = {
      itemDatas: [],

      type: 0,
      viewCount: 0,
      saveCount: 0,
      likeCount: 0,
      dislikeCount: 0,
    };

    this._isMounted = false;
  };

  onRefresh = () => {
    let params = {
      me_id: global.me ? global.me.id : 0,
      user_id: global._opponentId,
      page_number: '1',
      count_per_page: '1000',
    };
    showPageLoader(true);
    RestAPI.get_user_video_list(params, (json, err) => {
      showPageLoader(false);

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 1) {
          if (this._isMounted) {
            this.setState({
              type: json.data.type,
              viewCount: json.data.view_count,
              saveCount: json.data.save_count,
              likeCount: json.data.like_count,
              dislikeCount: json.data.dislike_count,
              itemDatas: json.data.video_list,
            });
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onPressVideo = (value) => {
    const {itemDatas} = this.state;
    const selIndex = itemDatas.findIndex((obj) => obj.id === value);

    global._selIndex = selIndex;
    global._profileOtherVideoDatas = itemDatas;
    global._prevScreen = 'profile_other';
    const pushAction = StackActions.push('profile_video', null);
    this.props.navigation.dispatch(pushAction);
  };

  onChangeLike = (value) => {
    // console.log('--- crn_dev --- value:', value);
    let params = {
      user_id: global.me ? global.me.id : 0,
      other_id: global._opponentId,
      type: value,
    };
    RestAPI.update_user_like(params, (json, err) => {
      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 1) {
          if (this._isMounted) {
            this.setState({
              likeCount: json.data.like_count,
              dislikeCount: json.data.dislike_count,
            });
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    const {itemDatas} = this.state;

    return (
      <>
        <SafeAreaView style={GStyles.statusBar} />
        <SafeAreaView style={GStyles.container}>
          {this._renderHeader()}
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={GStyles.elementContainer}>
            {this._renderAvartar()}
            {this._renderLike()}
            {this._renderVideo()}
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </>
    );
  }

  _renderHeader = () => {
    return (
      <GHeaderBar
        headerTitle="Profile"
        leftType="back"
        onPressLeftButton={this.onBack}
      />
    );
  };

  _renderAvartar = () => {
    const {viewCount, saveCount} = this.state;

    return (
      <View>
        <View style={{alignItems: 'center', marginVertical: 20}}>
          <View>
            <Avatar
              image={{uri: global._opponentPhoto}}
              size={106}
              // borderRadius={53}
              // borderWidth={2}
            />
          </View>
          <Text style={{...GStyles.regularText, marginTop: 8}}>
            {global._opponentName}
          </Text>
        </View>
        <View style={{position: 'absolute', marginTop: 24}}>
          <Text style={{...GStyles.regularText}}>Views : {viewCount}</Text>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
            <Image
              source={ic_favorite}
              style={{
                ...GStyles.image,
                width: 20,
                tintColor: GStyle.redColor,
              }}></Image>
            <Text
              style={{
                ...GStyles.regularText,
                marginRight: 10,
                marginLeft: 4,
              }}>
              {saveCount}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  _renderLike = () => {
    const {type, likeCount, dislikeCount} = this.state;
    const options = [
      {
        label: 'Dislike (' + dislikeCount + ')',
        value: '0',
        imageIcon: ic_dislike,
      },
      {label: 'Neutral', value: '1'},
      {label: 'Like (' + likeCount + ')', value: '2', imageIcon: ic_like},
    ];

    return (
      <View>
        <SwitchSelector
          initial={0}
          value={type}
          textColor={'green'}
          selectedColor={'#ffffff'}
          buttonColor={'green'}
          borderColor={'green'}
          hasPadding
          disableValueChangeOnPress
          options={options}
          onPress={(value) => this.onChangeLike(value)}
          imageStyle={{
            width: 20,
            height: 20,
            resizeMode: 'contain',
            marginRight: 4,
          }}
          textStyle={{fontSize: 14}}
        />
      </View>
    );
  };

  _renderVideo = () => {
    const {itemDatas} = this.state;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginVertical: 50,
        }}>
        {itemDatas.map((item, i) => {
          return (
            <View
              key={i}
              style={{
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'white',
              }}>
              <View
                style={{
                  ...GStyles.centerAlign,
                  width: 52,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: 'lightgray',
                  marginVertical: 4,
                }}>
                <Text style={{...GStyles.mediumText}}>{item.number}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.onPressVideo(item.id);
                }}>
                <FastImage
                  source={{
                    uri: item.thumb,
                    priority: FastImage.priority.normal,
                  }}
                  resizeMode={FastImage.resizeMode.stretch}
                  style={{
                    width: CELL_WIDTH,
                    height: 120,
                  }}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      // <View
      //   style={{
      //     flex: 1,
      //     flexDirection: 'row',
      //     flexWrap: 'wrap',
      //     marginVertical: 20,
      //   }}>
      //   {itemDatas.map((item, i) => {
      //     return (
      //       <View
      //         key={i}
      //         style={{
      //           alignItems: 'center',
      //           borderWidth: 1,
      //           borderColor: 'white',
      //         }}>
      //         <TouchableOpacity
      //           onPress={() => {
      //             this.onPressVideo(item.id);
      //           }}>
      //           <Image
      //             source={{uri: item.thumb}}
      //             style={{
      //               width: CELL_WIDTH,
      //               height: 120,
      //               resizeMode: 'stretch',
      //               borderRadius: 12,
      //             }}
      //           />
      //         </TouchableOpacity>
      //       </View>
      //     );
      //   })}
      // </View>
    );
  };
}

const styles = StyleSheet.create({});

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <ProfileOtherScreen {...props} navigation={navigation} route={route} />
  );
}
