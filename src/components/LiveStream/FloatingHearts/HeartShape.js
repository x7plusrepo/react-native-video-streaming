import React from 'react';
import MaterialIcon from 'react-native-vector-icons/FontAwesome';

const HeartShape = () => {
  // return (
  //   <CachedImage
  //     source={require('../../../assets/images/Icons/ico_heart.png')}
  //     style={{
  //       width: 40,
  //       height: 40,
  //     }}
  //   />
  // );
  return (
    <MaterialIcon
      size={36}
      name={'heart'}
      color={'red'}
      suppressHighlighting={true}
    />
  );
};

export default HeartShape;
