import { StyleSheet } from 'react-native';
import { GStyles } from '../../../utils/Global';

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  infoWrapper: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  streamerInfoWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  streamerGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: '#9F9A92',
    height: 32,
  },
  userAvatarImage: {
    width: 32,
    height: 32,
    position: 'absolute',
    top: '50%',
    left: 0,
    transform: [{ translateX: 0 }, { translateY: -16 }],
  },
  decorationImage: {
    width: 56,
    height: 56,
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: [{ translateX: -12 }, { translateY: -28 }],
  },
  textWrapper: {
    marginHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  streamInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnClose: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 8,
    borderRadius: 16,
  },
  icoClose: {
    width: 16,
    height: 16,
    tintColor: 'white',
  },
  infoLabelWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(34, 34, 34, 0.71)',
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 32,
  },
  infoText: {
    ...GStyles.textExtraSmall,
  },
  archiveText: {
    ...GStyles.textSmall,
    color: '#FDFFA5',
  },
  infoIcon: {
    width: 12,
    height: 12,
    marginRight: 6,
  },
  badgeWrapper: {
    marginTop: 8,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  badgeText: {
    ...GStyles.textSmall,
    fontWeight: '700',
  },
});

export default styles;
