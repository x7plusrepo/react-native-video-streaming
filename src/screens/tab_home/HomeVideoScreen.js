import React, { useEffect, useState, useRef, forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useNavigation,
  StackActions,
} from '@react-navigation/native';

import { Helper, Constants, RestAPI } from '../../utils/Global';
import useIsMountedRef from '../../hooks/useIsMountedRef';
import GStyle, { GStyles } from '../../utils/Global/Styles';
import ProductsList from '../../components/elements/ProductsList';

const HomeVideoScreen = (props) => {
  const { category } = props;
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [isFetching, setIsFetching] = useState(false);
  const [currentSubCategory, setCurrentSubCategory] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [curPage, setCurPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [onEndReachedDuringMomentum, setOnEndReachedDuringMomentum] =
    useState(true);

  useEffect(() => {
    onRefresh('init');
  }, [currentSubCategory]);

  const onRefresh = (type) => {
    if (isFetching) {
      return;
    }

    const newPage = type === 'more' ? curPage + 1 : 1;
    setCurPage(newPage);
    if (type === 'more') {
      const maxPage =
        (totalCount + Constants.COUNT_PER_PAGE - 1) / Constants.COUNT_PER_PAGE;
      if (newPage > maxPage) {
        return;
      }
    }
    setCurPage(newPage);

    if (type === 'init') {
      //showForcePageLoader(true);
    } else {
      setIsFetching(true);
    }
    let params = {
      user_id: global.me ? global.me?.id : '',
      page_number: type === 'more' ? newPage : '1',
      count_per_page: Constants.COUNT_PER_PAGE,
      category: category?.id,
      subCategory: currentSubCategory?.id,
    };
    RestAPI.get_quick_search_video_list(params, (json, err) => {
      showForcePageLoader(false);
      setIsFetching(false);

      if (err !== null) {
        Helper.alertNetworkError(err?.message);
      } else {
        if (json.status === 200) {
          setTotalCount(json.data.totalCount || 0);
          if (type === 'more') {
            let data = products.concat(json.data.videoList || []);
            setProducts(data);
          } else {
            setProducts(json.data.videoList || []);
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  const onPressVideo = (item) => {
    const selIndex = products.findIndex((obj) => obj.id === item?.id);

    global._curPage = curPage;
    global._totalCount = totalCount;
    global._selIndex = selIndex;
    global._exploreMainVideoDatas = products;
    global._prevScreen = 'home_main_video';
    const pushAction = StackActions.push('profile_video', null);
    navigation.dispatch(pushAction);
  };

  const _renderVideo = () => {
    return (
      <View style={{ flex: 1 }}>
        <ProductsList
          products={products}
          ref={flatListRef}
          onRefresh={onRefresh}
          isFetching={isFetching}
          onPressVideo={onPressVideo}
          onEndReachedDuringMomentum={onEndReachedDuringMomentum}
          setOnEndReachedDuringMomentum={setOnEndReachedDuringMomentum}
        />
      </View>

    );
  };

  const onPressSubCategory = (subCategory) => {
    setCurrentSubCategory(subCategory);
  };

  const _renderSubCategories = () => {
    const subCategories = category?.subCategories || [];
    return (
      <View style={styles.subCategoriesContainer}>
        {subCategories.map((subCategory, index) => {
          const selected = currentSubCategory?.id === subCategory?.id;
          return (
            <TouchableOpacity
              style={[
                styles.subCategoryButton,
                selected && { backgroundColor: GStyle.activeColor },
              ]}
              key={index.toString()}
              onPress={() => onPressSubCategory(subCategory)}
            >
              <Text
                style={[styles.subCategoryText, selected && { color: 'white' }]}
              >
                {subCategory.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        {_renderSubCategories()}
        {_renderVideo()}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  subCategoriesContainer: {
    padding: 16,
    ...GStyles.rowContainer,
    flexWrap: 'wrap',
  },
  subCategoryButton: {
    marginLeft: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    ...GStyles.centerAlign,
    backgroundColor: GStyle.grayBackColor,
    marginBottom: 6,
    borderRadius: 120,
  },
  subCategoryText: {
    ...GStyles.textSmall,
    color: GStyle.grayColor,
    ...GStyles.semiBoldText,
  },
});

export default HomeVideoScreen;
