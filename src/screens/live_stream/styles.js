import { Dimensions, StyleSheet } from 'react-native';
import { Helper } from '../../utils/Global';
import { GStyles } from '../../utils/Global/Styles';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3498db',
  },
  backgroundContainer: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    marginTop: 24,
    zIndex: 999,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    zIndex: 9,
    width: '100%',
  },
  playerView: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width,
    backgroundColor: 'black',
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
    marginTop: 32,
  },
  beginLiveStreamText: {
    ...GStyles.regularText,
    fontWeight: '700',
    color: 'white',
  },
  wrapperStartPanel: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
  },
  topicInput: {
    ...GStyles.regularText,
    height: 48,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'white',
    textAlign: 'center',
    width: '75%',
    color: 'white',
  },
});

export default styles;
