import { StyleSheet } from 'react-native';
import GStyle from '../../utils/Global/Styles';

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 64,
   },
  flatListContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 64,
  },
  tabBarTextStyle: {
    fontFamily: 'GothamPro-Medium',
    fontSize: 16,
    fontWeight: '500'
  }
});

export default styles;
