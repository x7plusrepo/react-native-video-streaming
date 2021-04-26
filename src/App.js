import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { Provider } from 'react-redux';
import { store } from './redux/store';

// import RestAPI from './DB/RestAPI';
// import Constants from './DB/Constants';
import {
  GStyle,
  GStyles,
  Global,
  Helper,
  Constants,
} from './utils/Global/index';

import OneSignal from 'react-native-onesignal'; // Import package from node modules
import AppNavigator from './navigation/AppNavigator';
import { MenuProvider } from 'react-native-popup-menu';
import { Provider as PaperProvider } from 'react-native-paper';

import FlashMessage, {
  showMessage,
  hideMessage,
} from 'react-native-flash-message';
import PageLoaderIndicator from '../src/components/PageLoaderIndicator';

function App() {
  const [isShowPageLoader, setIsShowPageLoader] = useState(false);

  useEffect(() => {
    OneSignal.setLogLevel(6, 0);

    // Replace 'YOUR_ONESIGNAL_APP_ID' with your OneSignal App ID.
    OneSignal.init('26974209-5e4f-40e7-a8ec-732b81998f01', {
      kOSSettingsKeyAutoPrompt: false,
      kOSSettingsKeyInAppLaunchURL: false,
      kOSSettingsKeyInFocusDisplayOption: 2,
    });
    OneSignal.inFocusDisplaying(2); // Controls what should happen if a notification is received while the app is open. 2 means that the notification will go directly to the device's notification center.

    // The promptForPushNotifications function code will show the iOS push notification prompt. We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step below)
    OneSignal.promptForPushNotificationsWithUserResponse(myiOSPromptCallback);

    OneSignal.addEventListener('received', onReceived);
    OneSignal.addEventListener('opened', onOpened);
    OneSignal.addEventListener('ids', onIds);

    return () => {
      OneSignal.removeEventListener('received', onReceived);
      OneSignal.removeEventListener('opened', onOpened);
      OneSignal.removeEventListener('ids', onIds);
    };
  }, []);

  const onReceived = (notification) => {
    console.log('Notification received: ', notification);

    if (notification.isAppInFocus) {
      Helper.callFunc(global.onSetUnreadCount);
    }
  };

  const onOpened = async (openResult) => {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);

    if (!openResult.notification.isAppInFocus) {
      Helper.callFunc(global.onGotoMessageTab);
    }
    // else {
    //   Helper.callFunc(global.onSetUnreadCount);
    // }
  };

  const onIds = async (device) => {
    console.log('Device info: ', device);
    global._pushToken = device.pushToken;
    global._pushAppId = device.userId;
  };

  global.success = (title, text) => {
    showMessage({
      message: title,
      description: text,
      type: 'success',
      icon: 'auto',
    });
  };

  global.warning = (title, text) => {
    showMessage({
      message: title,
      description: text,
      type: 'warning',
      icon: 'auto',
    });
  };

  global.error = (title, text) => {
    showMessage({
      message: title,
      description: text,
      type: 'error',
      icon: 'auto',
    });
  };

  global.showForcePageLoader = (isShow) => {
    setIsShowPageLoader(isShow);
  };

  global.showPageLoader = (isShow) => {
    setIsShowPageLoader(false);
  };

  return (
    <Provider store={store}>
      <View style={styles.container}>
        <PaperProvider>
          <MenuProvider>
            <AppNavigator />
          </MenuProvider>
        </PaperProvider>
        <FlashMessage position="top" />
        {/*<PageLoaderIndicator isPageLoader={isShowPageLoader} />*/}
        {/*<View style={{flex: 1, backgroundColor: 'white', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>

        </View>*/}
      </View>
    </Provider>
  );
}

function myiOSPromptCallback(permission) {
  // do something with permission value
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default App;
