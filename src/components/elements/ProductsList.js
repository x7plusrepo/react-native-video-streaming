import React, { forwardRef } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import ExploreVideoItem from './ExploreVideoItem';

const ProductsList = forwardRef((props, ref) => {
  const {
    products = [],
    isFetching = false,
    onRefresh,
    onPressVideo,
    onEndReachedDuringMomentum,
    setOnEndReachedDuringMomentum,
  } = props;

  const _renderFooter = () => {
    if (!isFetching) {
      return null;
    }

    return <ActivityIndicator style={{ color: '#000' }} />;
  };

  const _renderItem = ({ item, index }) => {
    return (
      <ExploreVideoItem
        item={item}
        onPress={() => {
          onPressVideo && onPressVideo(item);
        }}
        index={index}
      />
    );
  };

  return (
    <FlatList
      ref={ref}
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      numColumns={2}
      onRefresh={() => {
        onRefresh && onRefresh('pull');
      }}
      refreshing={!!isFetching}
      ListFooterComponent={_renderFooter}
      onEndReachedThreshold={0.4}
      onMomentumScrollBegin={() => {
        setOnEndReachedDuringMomentum && setOnEndReachedDuringMomentum(false);
      }}
      onEndReached={() => {
        if (!onEndReachedDuringMomentum) {
          onRefresh && onRefresh('more');
          setOnEndReachedDuringMomentum &&
          setOnEndReachedDuringMomentum(true);
        }
      }}
      data={products}
      renderItem={_renderItem}
      contentContainerStyle={{ paddingBottom: 64 }}
      keyExtractor={(item, index) => index.toString()}
    />
  );
});

export default ProductsList;
