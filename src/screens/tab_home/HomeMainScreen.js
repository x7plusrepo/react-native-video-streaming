import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { connect } from 'react-redux';
import { setKeyword } from '../../redux/home/actions';

import { useNavigation, useRoute } from '@react-navigation/native';
import ScrollableTabView, {
  ScrollableTabBar,
} from 'react-native-scrollable-tab-view';

import {
  Constants,
  GStyle,
  GStyles,
  Helper,
  RestAPI,
} from '../../utils/Global';
const ic_search = require('../../assets/images/Icons/ic_search.png');

import HomeVideoScreen from './HomeVideoScreen';
import { setCategories } from '../../redux/categories/actions';

class HomeMainScreen extends React.Component {
  constructor(props) {
    super(props);
    console.log('HomeMainScreen start');
    this.init();
  }

  componentDidMount() {
    this._isMounted = true;

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('home'));
      Helper.setLightStatusBar();
    });
    this.refreshCategories();
  }

  componentWillUnmount() {
    this.unsubscribe();

    this._isMounted = false;
  }

  init = () => {
    this.state = {
      isFetching: false,
      categories: [],
    };

    this._isMounted = false;
  };

  refreshCategories = () => {
    const { isFetching } = this.state;
    if (isFetching) {
      return;
    }
    let params = {
      user_id: global.me ? global.me?.id : '',
    };
    showForcePageLoader(true);
    RestAPI.get_product_categories(params, (json, error) => {
      this.setState({ isFetching: false });
      showForcePageLoader(false);

      if (error !== null) {
        Helper.alertNetworkError(error?.message);
      } else {
        if (json.status === 200) {
          const response = json.data || [];
          this.props.setCategories(response);
          const categories = response
            .filter((category) => !!!category.parent)
            .map((parent, index) => {
              const subCategories = response.filter(
                (category, index) => category.parent?.id === parent.id,
              );
              return {
                ...parent,
                subCategories,
              };
            });
          this.setState({
            categories,
          });
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onPressSearch = () => {
    const { navigation } = this.props;
    navigation.navigate('home_search');
  };

  render() {
    const { categories } = this.state;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollableTabView
          initialPage={0}
          tabBarBackgroundColor="white"
          tabBarTextStyle={styles.tabBarTextStyle}
          tabBarInactiveTextColor={'black'}
          tabBarActiveTextColor={GStyle.activeColor}
          tabBarUnderlineStyle={{ backgroundColor: 'transparent' }}
          renderTabBar={(props) => {
            return (
              <View style={[GStyles.rowBetweenContainer, { paddingRight: 16 }]}>
                <ScrollableTabBar {...props} style={styles.scrollBar} />
                <TouchableOpacity onPress={this.onPressSearch}>
                  <Image
                    source={ic_search}
                    style={{
                      ...GStyles.actionIcons,
                      tintColor: '#5F5F5F',
                    }}
                  />
                </TouchableOpacity>
              </View>
            );
          }}
        >
          {categories.map((category, index) => (
            <HomeVideoScreen
              tabLabel={category.title}
              category={category}
              key={index.toString()}
            />
          ))}
        </ScrollableTabView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  tabBarTextStyle: {
    fontFamily: 'GothamPro-Medium',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollBar: {
    borderWidth: 0,
    backgroundColor: 'white',
    flex: 1,
    marginRight: 16,
  },
});

const THomeMainScreen = (props) => {
  let navigation = useNavigation();
  let route = useRoute();
  return <HomeMainScreen {...props} navigation={navigation} route={route} />;
};

export default connect((state) => ({}), { setCategories })(THomeMainScreen);
