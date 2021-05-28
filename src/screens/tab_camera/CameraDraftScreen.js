import React from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

import {useNavigation, useRoute, StackActions} from '@react-navigation/native';
import RNFS from 'react-native-fs';

import {NavigationContext} from '@react-navigation/native';

import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
} from '../../utils/Global/index';
import GHeaderBar from '../../components/GHeaderBar';
import Avatar from '../../components/elements/Avatar';
import ProductsList from "../../components/elements/ProductsList";

const img_default_avatar = require('../../assets/images/Icons/ic_default_avatar.png');

const WINDOW_WIDTH = Helper.getWindowWidth();
const CELL_WIDTH = (WINDOW_WIDTH - 24 ) / 3.0;

class CameraDraftScreen extends React.Component {
  static contextType = NavigationContext;

  constructor(props) {
    super(props);

    console.log('CameraDraftScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
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
    };

    this._isMounted = false;
  };

  onRefresh = async () => {
    try {
      const videoDraft = await Helper.getLocalValue(Constants.KEY_VIDEO_DRAFT);

      if (videoDraft !== null) {
        const itemDatas = JSON.parse(videoDraft);
        this.setState({itemDatas});
      }
    } catch (e) {
      // error reading value
    }
  };

  onPressVideo = (item) => {
    global._draftVideoUri = item.video;
    global._draftThumbUri = item.thumb;

    global._prevScreen = 'camera_draft';
    this.props.navigation.navigate('camera_preview');

  };

  onBack = () => {
    this.props.navigation.goBack();
  };

  onClear = () => {
    Alert.alert(
      'Confirm',
      'Are you sure to clear draft?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {text: 'Yes', onPress: () => this.clearVideo()},
      ],
      {cancelable: true},
    );
  };

  clearVideo = async () => {
    showForcePageLoader(true);

    const itemDatas = [];
    await Helper.setLocalValue(
      Constants.KEY_VIDEO_DRAFT,
      JSON.stringify(itemDatas),
    );

    RNFS.unlink(Helper.getDraftDirectoryPath());

    this.setState({itemDatas});

    showForcePageLoader(false);
  };

  render() {
    return (
      <>
        <SafeAreaView style={GStyles.statusBar} />
        <SafeAreaView style={[GStyles.container]}>
          {this._renderHeader()}
          {this._renderVideo()}
        </SafeAreaView>
      </>
    );
  }

  _renderHeader = () => {
    return (
      <GHeaderBar
        headerTitle="Draft"
        leftType="back"
        onPressLeftButton={this.onBack}
      />
    );
  };

  _renderVideo = () => {
    const { isFetching, itemDatas } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <ProductsList
          products={itemDatas}
          onRefresh={this.onRefresh}
          isFetching={isFetching}
          onPressVideo={this.onPressVideo}
          onEndReachedDuringMomentum={true}
        />
      </View>
    );
  };

  // _renderVideo = () => {
  //   const {itemDatas} = this.state;
  //
  //   return (
  //     <View
  //       style={{
  //         flexDirection: 'row',
  //         flexWrap: 'wrap',
  //         justifyContent: 'space-evenly',
  //         marginVertical: 24,
  //         marginTop: 8,
  //       }}>
  //       {itemDatas.map((item, i) => {
  //         return (
  //           <View
  //             key={i}
  //             style={{
  //               alignItems: 'center',
  //               borderColor: 'white',
  //             }}>
  //             <TouchableOpacity
  //               onPress={() => {
  //                 this.onPressVideo(item);
  //               }}>
  //               <FastImage
  //                 source={{uri: item.thumb || ''}}
  //                 resizeMode={FastImage.resizeMode.stretch}
  //                 style={{
  //                   width: CELL_WIDTH,
  //                   height: 120,
  //                 }}
  //               />
  //             </TouchableOpacity>
  //           </View>
  //         );
  //       })}
  //     </View>
  //   );
  // };
}

const styles = StyleSheet.create({});

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return <CameraDraftScreen {...props} navigation={navigation} route={route} />;
}
