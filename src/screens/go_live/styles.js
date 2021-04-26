import { StyleSheet } from 'react-native';
import { Helper } from '../../utils/Global';
import { GStyles } from '../../utils/Global/Styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3498db',
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    marginTop: 24,
    zIndex: 9999,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    zIndex: 9,
  },
  center: {
    flex: 1,
  },
  streamerView: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Helper.getWindowWidth(),
    height: Helper.getWindowHeight(),
  },
  bottomGroup: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  btnBeginLiveStream: {
    borderRadius: 24,
    paddingVertical: 12,
    width: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32
  },
  beginLiveStreamText: {
    ...GStyles.regularText,
    fontWeight: '600',
    color: 'white',
  },
  wrapperStartPanel: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    //zIndex: 999,
  },
  topicInput: {
    ...GStyles.regularText,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'white',
    textAlign: 'center',
    width: '75%',
    color: 'white',
  },
  controllers: {
    position: 'absolute',
    right: 16,
    bottom: 32 + 36,
    zIndex: 99,
  },
});

export default styles;
