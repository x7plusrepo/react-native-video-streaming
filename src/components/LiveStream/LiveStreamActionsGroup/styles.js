import { StyleSheet } from 'react-native';
import { GStyles } from '../../../utils/Global/Styles';

const styles = StyleSheet.create({
  messageInput: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...GStyles.liveStreamActionButtons,
  },
  textInput: {
    flex: 1,
    ...GStyles.textSmall
  },
  joinButton: {
    ...GStyles.rowEndContainer,
    marginLeft: 10,
    ...GStyles.liveStreamActionButtons,
  },
  shareButton: {
    ...GStyles.rowEndContainer,
    marginLeft: 10,
    ...GStyles.liveStreamActionButtons,
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
  iconAction: {
    width: 16,
    height: 16,
    marginRight: 6,
  }
});

export default styles;
