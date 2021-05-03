import { StyleSheet } from 'react-native';
import { Helper } from './../../../utils/Global';
const screenWidth = Helper.getWindowWidth();
const giftSize = (screenWidth - 32 - 16 * 8) / 6;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  giftIcon: {
    width: giftSize,
    height: giftSize,
  },
  giftContainer: {
    marginBottom: 16,
    marginHorizontal: 8,
  },
});

export default styles;
