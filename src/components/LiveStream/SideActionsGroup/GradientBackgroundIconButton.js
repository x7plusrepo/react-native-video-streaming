import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';

const GradientBackgroundIconButton = (props) => {
    const { icon, onPress } = props;
  return (
    <TouchableOpacity activeOpacity={0.6} style={styles.wrapper} onPress={onPress}>
      <LinearGradient
        colors={[
          'rgba(200, 58, 132, 0.71)',
          'rgba(200, 58, 253, 0.71)',
          'rgba(200, 58, 132, 0.71)',
        ]}
        style={styles.gradient}
      >
        <Image source={icon} style={styles.icon} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GradientBackgroundIconButton;
