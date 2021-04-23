import { StyleSheet } from 'react-native';
import { Helper } from '../../utils/Global';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3498db',
  },
  contentWrapper: { flex: 1 },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 24,
  },
  footer: {
    //flex: 0.1,
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
  btnClose: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  icoClose: {
    width: 20,
    height: 20,
  },
  bottomGroup: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  btnBeginLiveStream: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  beginLiveStreamText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
});

export default styles;
