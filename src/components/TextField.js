import React, {useRef} from 'react';

import {Keyboard, TextInput} from 'react-native';

const TextField = (props) => {
  const inputRef = useRef(null);
  const onBlur = () => {
    setTimeout(() => {
      console.log(0);
      Keyboard.dismiss();
    }, 200);
  };
  return <TextInput {...props} ref={inputRef} onBlur={onBlur} />;
};

export default TextField;
