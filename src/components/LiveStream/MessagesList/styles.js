import { StyleSheet, Dimensions } from 'react-native';
import {GStyles} from '../../../utils/Global/Styles';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  wrapListMessages: {
    height: screenWidth / 1.5,
    width: screenWidth,
    paddingHorizontal: 16,
    zIndex: 2,
    marginBottom: 24
  },
  chatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageItem: {
    flexDirection: 'column',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  name: {
    ...GStyles.liveStreamChatSender,
  },
  content: {
    marginTop: 3,
    ...GStyles.liveStreamChatText
  },
});

export default styles;
