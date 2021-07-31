import React, {useEffect, useState} from 'react';
import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import branch from 'react-native-branch';

import {Provider} from 'react-redux';
import {store} from './redux/store';
// import RestAPI from './DB/RestAPI';
// import Constants from './DB/Constants';
import {Constants, Helper} from './utils/Global';

import OneSignal from 'react-native-onesignal'; // Import package from node modules
import AppNavigator from './navigation/AppNavigator';
import {Provider as PaperProvider} from 'react-native-paper';
import * as RootNavigation from './utils/Global/RootNavigation';
import {isReadyRef, navigationRef} from './utils/Global/RootNavigation';

import FlashMessage, {showMessage} from 'react-native-flash-message';
import PageLoaderIndicator from '../src/components/PageLoaderIndicator';
import ic_logo_01 from './assets/images/Icons/ic_logo_01.png';
import LiveStreamSocketManager from './utils/LiveStream/SocketManager';
import ChatStreamSocketManager from './utils/Message/SocketManager';
import GStyle from './utils/Global/Styles';
import CachedImage from './components/CachedImage';

const handleDeepLink = ({ product, roomId, post }) => {
  global._prevScreen = 'deep_link';
  if (product) {
    try {
      global._selIndex = 0;

      if (typeof product === 'string') {
        global._productsList = [JSON.parse(product)];
      } else {
        global._productsList = [product];
      }
    } catch (error) {}

    RootNavigation.navigate('profile_video', { isDeepLinking: true });
  } else if (post) {
    try {
      global._selIndex = 0;

      if (typeof post === 'string') {
        global._postsList = [JSON.parse(post)];
      } else {
        global._postsList = [post];
      }
    } catch (error) {}

    RootNavigation.navigate('post_detail', { isDeepLinking: true });
  } else if (roomId) {
    RootNavigation.navigate('view_live', { roomId });
  }
};

const subscribeDeepLink = () => {
  return branch.subscribe(({ error, params, uri }) => {
    if (error) {
      console.error('Error from Branch: ' + error);
      return;
    }

    // params will never be null if error is null

    if (params['+non_branch_link']) {
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
    const { roomId, product, post } = params;
    if (isReadyRef.current && navigationRef.current) {
      handleDeepLink({ product, roomId, post });
    } else {
      setTimeout(() => {
        handleDeepLink({ product, roomId, post });
      }, 5000);
    }
  });
};

function App() {
  const [isShowPageLoader, setIsShowPageLoader] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    const getDeviceState = async () => {
      const deviceState = await OneSignal.getDeviceState();
      global._pushToken = deviceState.pushToken;
      global._pushAppId = deviceState.userId;
    };
    OneSignal.setLogLevel(6, 0);
    OneSignal.setAppId('b90b63c2-bbc8-4c56-84fe-39298ff4ca45');
    OneSignal.setNotificationWillShowInForegroundHandler(onReceived);
    OneSignal.setNotificationOpenedHandler(onOpened);
    if (Platform.OS !== 'ios') {
      // The promptForPushNotifications function code will show the iOS push notification prompt. We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step below)
      OneSignal.promptForPushNotificationsWithUserResponse(myiOSPromptCallback);
    }
    getDeviceState();
    const branchUnsubscribe = subscribeDeepLink();
    LiveStreamSocketManager.instance.connect();
    ChatStreamSocketManager.instance.connect();
    ChatStreamSocketManager.instance.listenReceiveMessages();

    return () => {
      LiveStreamSocketManager.instance.disconnect();
      ChatStreamSocketManager.instance.disconnect();
      ChatStreamSocketManager.instance.removeReceiveMessages();
      branchUnsubscribe();
    };
  }, []);

  const onReceived = (notifReceivedEvent) => {
    const notif = notifReceivedEvent.getNotification();
    notifReceivedEvent.complete(notif);
    Helper.callFunc(global.onSetUnreadCount);
  };

  const onOpened = async (openResult) => {
    if (!global.me) {
      try {
        const userString = await Helper.getLocalValue(Constants.KEY_USER);
        if (userString) {
          global.me = JSON.parse(userString);
        }
      } catch (error) {}
    }

    await Helper.setDeviceId();
    await Helper.hasPermissions();

    setIsShowPageLoader(true);

    if (isReadyRef.current && navigationRef.current) {
      RootNavigation.navigate('message');
    } else {
      setTimeout(() => {
        RootNavigation.navigate('message');
      }, 5000);
    }
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
    <View style={styles.container}>
      <Provider store={store}>
        <PaperProvider>
          <AppNavigator />
          <FlashMessage position="top" />
          <PageLoaderIndicator isPageLoader={isShowPageLoader} />
          {initLoading && (
            <View style={styles.splashContainer}>
              <StatusBar hidden={true} />
              <CachedImage source={ic_logo_01} style={styles.logo} />
            </View>
          )}
        </PaperProvider>
      </Provider>
    </View>
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
    backgroundColor: GStyle.activeColor,
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
