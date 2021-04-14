import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';

import MainTabNavigator from './MainTabNavigator';

import SigninScreen from '../screens/auth/SigninScreen';
import SignupScreen from '../screens/auth/SignupScreen';

import CameraMainScreen from '../screens/tab_camera/CameraMainScreen';
import CameraUploadScreen from '../screens/tab_camera/CameraUploadScreen';
import CameraPreviewScreen from '../screens/tab_camera/CameraPreviewScreen';
import CameraDraftScreen from '../screens/tab_camera/CameraDraftScreen';

import MessageChatScreen from '../screens/tab_message/MessageChatScreen';

import HomeSearchScreen from '../screens/tab_home/HomeSearchScreen';

import ProfileEditScreen from '../screens/tab_profile/ProfileEditScreen';
import ProfileVideoScreen from '../screens/tab_profile/ProfileVideoScreen';
import ProfileOtherScreen from '../screens/tab_profile/ProfileOtherScreen';
import MessageMainScreen from '../screens/tab_message/MessageMainScreen';

import { GStyle, GStyles, Global, Helper } from '../utils/Global/index';
import SavedProductsScreen from '../screens/tab_profile/SavedProductsScreen';

// import WorkScreen from '../screens/modal/CProfessionalsSendOfferModal';
// import WorkScreen from '../screens/auth/FCAccountStep1Screen';
// import WorkScreen from '../screens/tab_play/HomeUploadScreen';
const WINDOW_HEIGHT = Helper.getWindowWidth();

const Stack = createStackNavigator();

const config = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

export default function App() {
  return (
    <NavigationContainer theme={{ colors: { background: 'black' } }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {/* --- start --- */}
        <Stack.Screen name="main_tab_navigator" component={MainTabNavigator} />

        {/* --- Auth --- */}
        <Stack.Screen name="signin" component={SigninScreen} />
        <Stack.Screen name="signup" component={SignupScreen} />

        {/* --- camera tab --- */}
        <Stack.Screen name="camera_main" component={CameraMainScreen} />
        <Stack.Screen name="camera_upload" component={CameraUploadScreen} />
        <Stack.Screen name="camera_preview" component={CameraPreviewScreen} />
        <Stack.Screen name="camera_draft" component={CameraDraftScreen} />

        {/* --- message tab --- */}
        <Stack.Screen name="message" component={MessageMainScreen} />
        <Stack.Screen name="message_chat" component={MessageChatScreen} />

        {/* --- home tab --- */}
        <Stack.Screen name="home_search" component={HomeSearchScreen} />

        {/* --- profile tab --- */}
        <Stack.Screen name="profile_edit" component={ProfileEditScreen} />
        <Stack.Screen
          name="profile_video"
          component={ProfileVideoScreen}
          options={{
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            gestureResponseDistance: { horizontal: WINDOW_HEIGHT },
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
        <Stack.Screen name="profile_other" component={ProfileOtherScreen} />
        <Stack.Screen name="saved_products" component={SavedProductsScreen} />
        <Stack.Screen name="my_posts" component={SavedProductsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
