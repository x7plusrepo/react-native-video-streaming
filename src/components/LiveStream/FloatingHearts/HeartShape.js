import React from 'react';
import { Image } from 'react-native';

const HeartShape = () => {
  return (
    <Image
      source={require('../../../assets/images/gifts/heart.png')}
      style={{
        width: 40,
        height: 40,
      }}
    />
  );
};

export default HeartShape;
