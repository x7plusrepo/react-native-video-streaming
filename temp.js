import { Text, View } from 'react-native';
import { GStyles } from './src/utils/Global';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import React from 'react';

<View style={{ ...GStyles.rowCenterContainer, marginVertical: 20 }}>

  <View style={{ flex: 1, ...GStyles.centerAlign }}>
    {global.me.isGuest && (
      <TouchableOpacity
        onPress={this.onPressSignin}
        style={{ ...styles.buttonFill, height: 30 }}
      >
        <Text style={{ ...styles.textFill }}>Signin</Text>
      </TouchableOpacity>
    )}
    {!global.me.isGuest && (
      <TouchableOpacity
        onPress={this.onPressCamera}
        style={{ ...styles.buttonFill, height: 30 }}
      >
        <Text style={{ ...styles.textFill }}>Upload Product</Text>
      </TouchableOpacity>
    )}
    <TouchableOpacity
      onPress={this.onPressCustomerSupport}
      style={{ ...styles.buttonFill, marginTop: 8 }}
    >
      <Text style={{ ...styles.textFill }}>Customer</Text>
      <Text style={{ ...styles.textFill }}>Support</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={this.onPressDraft}
      style={{ ...styles.buttonFill, height: 30, marginTop: 8 }}
    >
      <Text style={{ ...styles.textFill }}>Draft</Text>
    </TouchableOpacity>
  </View>
</View>;
