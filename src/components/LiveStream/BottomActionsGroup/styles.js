import { StyleSheet } from 'react-native';
import { GStyles } from '../../../utils/Global/Styles';

const styles = StyleSheet.create({
  messageInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...GStyles.liveStreamActionButtons,
  },
  textInput: {
    flex: 1,
    ...GStyles.textSmall,
  },
  wrapIconSend: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconSend: {
    width: 20,
    height: 20,
  },
  actionWrapper: {
    marginRight: 8,
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    padding: 10,
    overflow: 'hidden',
  },
});

export default styles;
