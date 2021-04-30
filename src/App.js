import React, { useState, useEffect } from 'react';
import { Image, StatusBar, StyleSheet, View } from 'react-native';
import branch, { BranchEvent } from 'react-native-branch';

import { Provider } from 'react-redux';
import { store } from './redux/store';

// import RestAPI from './DB/RestAPI';
// import Constants from './DB/Constants';
import {
  Helper,
  Constants,
} from './utils/Global/index';

import OneSignal from 'react-native-onesignal'; // Import package from node modules
import AppNavigator from './navigation/AppNavigator';
import { MenuProvider } from 'react-native-popup-menu';
import { Provider as PaperProvider } from 'react-native-paper';
import * as RootNavigation from './utils/Global/RootNavigation';

import FlashMessage, {
  showMessage,
  hideMessage,
} from 'react-native-flash-message';
import PageLoaderIndicator from '../src/components/PageLoaderIndicator';
import ic_logo_01 from './assets/images/Icons/ic_logo_01.png';

const subscribeDeepLink = () => {
  branch.subscribe(({ error, params, uri }) => {
    if (error) {
      console.error('Error from Branch: ' + error);
      return;
    }

    // params will never be null if error is null

    if (params['+non_branch_link']) {
      const nonBranchUrl = params['+non_branch_link'];
      // Route non-Branch URL if appropriate.
      return;
    }

    if (!params['+clicked_branch_link']) {
      // Indicates initialization success and some other conditions.
      // No link was opened.
      return;
    }

    // A Branch link was opened.
    // Route link based on data in params, e.g.

    // Get title and url for route
    // const title = params.$og_title;
    // const url = params.$canonical_url;
    // const image = params.$og_image_url;
    // const inviterId = params.inviterId;
    const roomId = params.roomId;
    RootNavigation.navigate('view_live', { roomId })
  });
};

function App() {
  const [isShowPageLoader, setIsShowPageLoader] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

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

    subscribeDeepLink();

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

  global.setIsInitLoading = (isLoading) => {
    setInitLoading(isLoading);
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
        <PageLoaderIndicator isPageLoader={isShowPageLoader} />
        {initLoading && (
          <View style={styles.splashContainer}>
            <StatusBar hidden={true} />
            <Image source={ic_logo_01} style={styles.logo} />
          </View>
        )}
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
  splashContainer: {
    flex: 1,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    width: Constants.WINDOW_WIDTH,
    height: Constants.WINDOW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999,
  },
  logo: {
    width: 120,
    height: 120,
  },
});

export default App;
