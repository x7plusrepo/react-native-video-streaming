import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import GHeaderBar from '../../components/GHeaderBar';

import { GStyles } from '../../utils/Global';

const CommentsScreen = (props) => {
  return (
    <SafeAreaView style={GStyles.container}>
      <GHeaderBar headerTitle="Comments" leftType="back" navigation={props.navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default CommentsScreen;
