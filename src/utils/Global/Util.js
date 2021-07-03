import {Alert, Dimensions, PermissionsAndroid, Platform, StatusBar,} from 'react-native';

import {PERMISSIONS, requestMultiple, RESULTS,} from 'react-native-permissions';
import AsyncStorage from '@react-native-community/async-storage';
import Moment from 'moment';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';
import RNFS from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';
import publicIP from 'react-native-public-ip';

import Constants from './Constants';

const Helper = {
  //** window */
  getWindowWidth: function () {
    return Dimensions.get('window').width;
  },

  getWindowHeight: function () {
    return Dimensions.get('window').height;
  },

  getContentWidth: function () {
    return Dimensions.get('window').width * 0.88;
  },

  getStatusBarHeight: function () {
    return StaticSafeAreaInsets.safeAreaInsetsTop;
  },

  getBottomBarHeight: function () {
    return Platform.OS === 'ios'
      ? StaticSafeAreaInsets.safeAreaInsetsBottom
      : 0;
  },

  setDarkStatusBar: function () {
    // if (Platform.OS === 'android') {
    //   StatusBar.setBackgroundColor('black');
    // }
    // StatusBar.setBarStyle('light-content');
    // changeNavigationBarColor('black', false);
  },

  setLightStatusBar: function () {
    // if (Platform.OS === 'android') {
    //   StatusBar.setBackgroundColor('white');
    // }
    // StatusBar.setBarStyle('dark-content');
    // changeNavigationBarColor('white', true);
  },

  alertNetworkError: function (message = 'Network error.') {
    Alert.alert('Error', message);
  },

  alertServerDataError: function () {
    Alert.alert(Constants.ERROR_TITLE, 'Failed to get data from server');
  },

  //** string */
  getShortString: (value, len = 30) => {
    try {
      if (value.length > len) {
        let res = value.substr(0, len) + ' ...';
        return res;
      }
      return value;
    } catch (ex) {
      return null;
    }
  },

  isEmptyString: (str) => {
    const newStr = Helper.removeWhiteSpace(str);
    return newStr == '';
  },

  removeWhiteSpace: (str) => {
    if (str) {
      const newStr = str.replace(/\s/g, '');
      // const newStr = str.replace(' ', '');
      // const newStr = str.replace(/ /g, '');
      return newStr;
    } else {
      return '';
    }
  },

  removeFirstWhiteSpace: (str) => {
    if (str) {
      const newStr = str.replace(/\s+/, '');
      return newStr;
    } else {
      return '';
    }
  },

  capitalizeString: function (str) {
    if (str) {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    return '';
  },

  //** type conversion */
  getFixedFloatString: (val) => {
    const number = parseFloat(val);
    if (!number) {
      return null;
    }
    return number.toFixed(2);
  },

  //** local save */
  setLocalValue: async function (key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      // saving error
    }
  },

  getLocalValue: async function (key) {
    let value = null;

    try {
      value = await AsyncStorage.getItem(key);
    } catch (e) {
      // error reading value
    }

    return value;
  },

  removeLocalValue: async function (key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      // remove error
    }
  },

  //** date */
  getTimeStamp: function () {
    return new Date().valueOf();
  },

  getDateString: (date) => {
    const y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();

    m = m < 10 ? '0' + m : m;
    d = d < 10 ? '0' + d : d;

    return y + '-' + m + '-' + d;
  },

  getTimeString: (date, isShowSecond = false) => {
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();

    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;

    if (isShowSecond) {
      return h + ':' + m + s;
    } else {
      return h + ':' + m + ':00';
    }
  },

  getDateTimeString: (date, isShowSecond = false) => {
    return (
      Constants.getDateString(date) +
      ' ' +
      Constants.getTimeString(date, isSHOWSecond)
    );
  },

  getCurMonthString: function () {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const d = new Date();
    return monthNames[d.getMonth()];
  },

  getLastMonthList: function () {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const d = new Date();
    const lastMonthList = [
      ...monthNames.slice(d.getMonth()),
      ...monthNames.slice(0, d.getMonth()),
    ].reverse();

    return lastMonthList;
  },

  getDateString4Input: function (inputDateString) {
    let date = Moment(inputDateString, 'MMM DD, YYYY').toDate();
    return Moment(date).format('YYYY-MM-DD');
  },

  getDateString4Server: function (serverDateString) {
    if (!serverDateString) return '';

    let serverDate = Moment(serverDateString);
    return serverDate.format('MMM DD, YYYY');
  },

  getPastTimeString: function (serverDateString) {
    if (!serverDateString) return '';

    const nowDate = Moment.utc();
    // let serverDate = Moment.utc(serverDateString).subtract({hours: 1});
    let serverDate = Moment.utc(serverDateString);
    let pastTime = Moment.duration(nowDate.diff(serverDate)).humanize();

    return pastTime;
  },

  getYear4DateString: function (monthYearString) {
    const stringArray = monthYearString.split('/');
    if (stringArray.length === 2) {
      return stringArray[1];
    }
    return '';
  },

  getMonth4DateString: function (monthYearString) {
    const stringArray = monthYearString.split('/');
    if (stringArray.length === 2) {
      return stringArray[0];
    }
    return '';
  },

  //** check, validate */
  validateEmail: function (email) {
    // const rex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // const rex = /\A(?=[a-z0-9@.!#$%&'*+/=?^_`{|}~-]{6,254}\z)(?=[a-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@)[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:(?=[a-z0-9-]{1,63}\.)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?=[a-z0-9-]{1,63}\z)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\z/
    const regexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regexp.test(email);
  },

  validatePhoneNumber: function (phoneNumber) {
    const regexp =
      /^[\+]?[0-9]{0,3}[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3,6}[-\s\.]?[0-9]{3,6}$/;
    return regexp.test(phoneNumber);
  },

  //** image */
  getMembershipImage: function (membershipPlan) {
    const ic_membership_free = require('../../assets/images/Icons/ic_membership_free.png');
    const ic_membership_basic = require('../../assets/images/Icons/ic_membership_basic.png');
    const ic_membership_professional = require('../../assets/images/Icons/ic_membership_professional.png');
    const ic_membership_business = require('../../assets/images/Icons/ic_membership_business.png');
    const ic_membership_executive = require('../../assets/images/Icons/ic_membership_executive.png');

    let membershipImage = ic_membership_free;

    switch (membershipPlan) {
      case 'Basic':
        membershipImage = ic_membership_free;
        break;
      case 'Basic+':
        membershipImage = ic_membership_basic;
        break;
      case 'Professional':
        membershipImage = ic_membership_professional;
        break;
      case 'Business':
        membershipImage = ic_membership_business;
        break;
      case 'Executive':
        membershipImage = ic_membership_executive;
        break;
      default:
        membershipImage = ic_membership_free;
        break;
    }

    return membershipImage;
  },

  //** utility */
  callFunc: function (func) {
    if (func) {
      func();
    }
  },

  //** permission */
  hasAndroidPermission: async function () {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';

    // if (Platform.OS === 'android') {
    //   PermissionsAndroid.requestMultiple([
    //     PermissionsAndroid.PERMISSIONS.CAMERA,
    //     PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    //     PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    //   ]).then((result) => {
    //     if (
    //       result['android.permission.ACCESS_COARSE_LOCATION'] &&
    //       result['android.permission.CAMERA'] &&
    //       result['android.permission.READ_CONTACTS'] &&
    //       result['android.permission.ACCESS_FINE_LOCATION'] &&
    //       result['android.permission.READ_EXTERNAL_STORAGE'] &&
    //       result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
    //     ) {
    //       this.setState({
    //         permissionsGranted: true,
    //       });
    //     } else if (
    //       result['android.permission.ACCESS_COARSE_LOCATION'] ||
    //       result['android.permission.CAMERA'] ||
    //       result['android.permission.READ_CONTACTS'] ||
    //       result['android.permission.ACCESS_FINE_LOCATION'] ||
    //       result['android.permission.READ_EXTERNAL_STORAGE'] ||
    //       result['android.permission.WRITE_EXTERNAL_STORAGE'] ===
    //         'never_ask_again'
    //     ) {
    //       this.refs.toast.show(
    //         'Please Go into Settings -> Applications -> APP_NAME -> Permissions and Allow permissions to continue',
    //       );
    //     }
    //   });
    // } else if (Platform.OS === 'ios') {
    //   Permissions.request('photo').then((response) => {
    //     if (response === 'authorized') {
    //       iPhotoPermission = true;
    //     }
    //     Permissions.request('contact').then((response) => {
    //       if (response === 'authorized') {
    //         iPhotoPermission = true;
    //       }
    //     });
    //   });
    // }
  },

  hasPermissions: async function () {
    let isGranted = false;

    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]).then((result) => {
        if (
          result['android.permission.READ_EXTERNAL_STORAGE'] &&
          result['android.permission.WRITE_EXTERNAL_STORAGE'] &&
          result['android.permission.CAMERA'] &&
          result['android.permission.RECORD_AUDIO'] === 'granted'
        ) {
          isGranted = true;
        } else if (
          result['android.permission.READ_EXTERNAL_STORAGE'] ||
          result['android.permission.WRITE_EXTERNAL_STORAGE'] ||
          result['android.permission.CAMERA'] ||
          result['android.permission.RECORD_AUDIO'] === 'never_ask_again'
        ) {
          console.log(
            '--- univ_dev --- :',
            'Please Go into Settings -> Applications -> APP_NAME -> Permissions and Allow permissions to continue',
          );
        }
      });
    } else if (Platform.OS === 'ios') {
      // checkMultiple([
      //   PERMISSIONS.IOS.CAMERA,
      //   PERMISSIONS.IOS.MICROPHONE,
      //   PERMISSIONS.IOS.MEDIA_LIBRARY,
      // ]).then((statuses) => {
      //   console.log(
      //     '--- univ_dev --- statuses[PERMISSIONS.IOS.CAMERA]:',
      //     statuses[PERMISSIONS.IOS.CAMERA],
      //   );
      //   console.log(
      //     '--- univ_dev --- status[PERMISSIONS.IOS.MICROPHONE]:',
      //     status[PERMISSIONS.IOS.MICROPHONE],
      //   );
      //   console.log(
      //     '--- univ_dev --- status[PERMISSIONS.IOS.MEDIA_LIBRARY]:',
      //     status[PERMISSIONS.IOS.MEDIA_LIBRARY],
      //   );
      // });

      requestMultiple([
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.MICROPHONE,
        PERMISSIONS.IOS.PHOTO_LIBRARY,
      ]).then((statuses) => {
        // console.log(
        //   '--- univ_dev --- statuses[PERMISSIONS.IOS.CAMERA]:',
        //   statuses[PERMISSIONS.IOS.CAMERA],
        // );
        // console.log(
        //   '--- univ_dev --- statuses[PERMISSIONS.IOS.MICROPHONE]:',
        //   statuses[PERMISSIONS.IOS.MICROPHONE],
        // );
        // console.log(
        //   '--- univ_dev --- statuses[PERMISSIONS.IOS.PHOTO_LIBRARY]:',
        //   statuses[PERMISSIONS.IOS.PHOTO_LIBRARY],
        // );

        if (
          statuses[PERMISSIONS.IOS.CAMERA] == RESULTS.GRANTED &&
          statuses[PERMISSIONS.IOS.MICROPHONE] == RESULTS.GRANTED &&
          statuses[PERMISSIONS.IOS.PHOTO_LIBRARY] == RESULTS.GRANTED
        ) {
          isGranted = true;
        }
      });
    }

    return isGranted;
  },

  //** file, directory */
  getFile4Path: function (path) {
    const fileName = path.substring(path.lastIndexOf('/') + 1, path.length);
    return fileName;
  },

  getFileName4Uri: function (uri) {
    let fileName = '';

    if (uri) {
      let uriParts = uri.split('/');
      fileName = uriParts[uriParts.length - 1];
    }

    return fileName;
  },

  getFileExt4Uri: function (uri) {
    let fileExt = '';

    if (uri) {
      let uriParts = uri.split('.');
      fileExt = uriParts[uriParts.length - 1];
    }

    return fileExt;
  },

  getDraftDirectoryPath: function () {
    const draftPath = RNFS.DocumentDirectoryPath + '/draft/';

    RNFS.mkdir(draftPath);

    return draftPath;
  },

  setDeviceId: async () => {
    if (global._deviceId && global._devId) {
      return;
    }

    const deviceId = await DeviceInfo.getUniqueId();

    if (deviceId.length < 8) {
      const ip = await publicIP();
      if (ip.length < 8) {
        error(Constants.ERROR_TITLE, 'Network error');
        global._deviceId = '';
        global._devId = 'xxxxxxxx';
      } else {
        const ipId = ip.replace(/\./g, '0');
        global._deviceId = ipId;
        global._devId = ipId.substr(ip.length - 8);
      }
    } else {
      global._deviceId = deviceId;
      global._devId = deviceId.substr(deviceId.length - 8);
    }
  },

  //** not used */
  getPackageId4Name: function (name) {
    let packgeId = 0;
    global.package_list.forEach((item) => {
      if (item.name == name) {
        packgeId = item.id;
      }
    });
    return packgeId;
  },

  getSkillName4Id: function (skillId) {
    let skillName = null;

    global.skill_list.forEach((item) => {
      if (item.id == skillId) {
        skillName = item.name;
      }
    });

    return skillName;
  },
  getLvLGuest: function (diamondSpent) {
    const levels = Constants.diamondLvLMap.filter(
      (item) => item.diamond <= diamondSpent,
    );
    const level = Math.max.apply(
      Math,
      levels.map(function (o) {
        return o.lvl;
      }),
    );

    return level || 1;
  },
  getLvlLiveStream: (elixir) => {
    const levels = Constants.elixirLvLMap.filter(
      (item) => item.elixir <= elixir,
    );
    const level = Math.max.apply(
      Math,
      levels.map(function (o) {
        return o.lvl;
      }),
    );

    return level || 0;
  },
  getElixirFromLvl: (lvl) => {
    const lvlItem = Constants.elixirLvLMap.find((level) => level.lvl === lvl);
    const maxElixir = Math.max.apply(
      Math,
      Constants.elixirLvLMap.map((o) => o.elixir),
    );

    return lvlItem && lvl >= 0 ? lvlItem.elixir : maxElixir;
  },
  getProgress: (elixir, lvl) => {
    const targetElixir = Helper.getElixirFromLvl(lvl + 1);
    const lvlElixir = Helper.getElixirFromLvl(lvl);
    const target = targetElixir - lvlElixir;
    const current = elixir - lvlElixir;
    return target <= 0 ? '100%' : `${Math.min(100, (current * 100) / target)}%`;
  },
};

export default Helper;
