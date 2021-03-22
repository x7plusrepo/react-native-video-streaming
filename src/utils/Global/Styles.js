import {StyleSheet} from 'react-native';

import Helper from './Util';

const WINDOW_WIDTH = Helper.getWindowWidth();
const BUTTON_WIDTH = WINDOW_WIDTH * 0.88;

const GStyle = {
  //** color */
  activeColor: '#800080',
  inactiveColor: '#2574FF',
  fontColor: '#272755',
  linkColor: '#0C4682',
  grayColor: '#9393AA',
  // grayColor: '#a9a9a9',
  grayBackColor: '#F0F0F0',
  lineColor: '#bbbbbb',
  modalBackColor: '#27275599',
  infoColor: '#778CA2',

  blackColor: '#000000',
  opacityBlack: '#00000099',
  snowColor: '#FAFAFA',
  orangeColor: '#E98123',
  // orangeColor: '#FE9870',
  greenColor: '#0EAD69',
  redColor: '#FF0000',
  // redColor: '#bd0008',
  // redColor: '#ff4444',
  transparentColor: '#FFFFFF00',

  buttonWhiteColor: '#FAFAFA',
  backWhiteColor: '#E7F6FB',

  blueColor: '#5B4EFE',
  lightBlueColor: '#64C7D1',

  purpleColor: '#9B30FF',
  // purpleColor: '#C98FD4',
  // purpleColor: '#6733BB',
  opacityPurpleColor: '#6733BBBB',
  greenColor: '#5CB85C',
  // greenColor: '#007225',
  // greenColor: '#119F3B',
  lightPurple: '#EFE7F1',
  yellowColor: '#FF9C1A',
  // yellowColor: '#F5B024',
  whiteColor: 'white',
  purpleOpacityColor: '#C98FD488',
  placeholderColor: '#fff8',
  inputColor: '#333',
  modalBackground: 'rgba(13,13,13,0.52)',

  borderRadius: 9,
  loginBackColor: '#EEEEEE',

  pinkColor: '#FF1493',
  // pinkColor: '#FF69B4',
  purpleColor1: '#242B48',
  purpleColor2: '#3A2E54',
  purpleColor3: '#4D315F',
  purpleColor4: '#63346B',

  loginButtonColor: '#D38AE0',

  googleColor: '#dd4b39',
  fbColor: '#385898',
  // fbColor: '#4267B2',

  menuInactiveColor: '#4D4D4D',

  //** other */
  buttonRadius: 15,
};

const GStyles = StyleSheet.create({
  statusBar: {
    flex: 0,
    backgroundColor: GStyle.snowColor,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  elementContainer: {
    flex: 1,
    width: '88.1%',
    height: '100%',
  },

  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowEndContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rowCenterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  absoluteContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  centerAlign: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: GStyle.grayColor,
    paddingBottom: 8,
  },

  shadow: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: GStyle.activeColor,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 10,
    shadowOpacity: 0.12,
    elevation: 3,
  },

  defaultShadow: {
    elevation: 5,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
  },

  bigText: {
    fontFamily: 'GothamPro-Medium',
    color: GStyle.fontColor,
    fontSize: 24,
    lineHeight: 32,
  },

  mediumText: {
    fontFamily: 'GothamPro-Medium',
    color: GStyle.blackColor,
    fontSize: 15,
  },

  regularText: {
    fontFamily: 'GothamPro',
    color: GStyle.blackColor,
    fontSize: 15,
  },

  titleText: {
    fontFamily: 'GothamPro-Medium',
    color: GStyle.fontColor,
    fontSize: 24,
    lineHeight: 28,
    marginTop: 20,
  },

  titleDescription: {
    fontFamily: 'GothamPro',
    color: GStyle.fontColor,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 20,
  },

  notifyTitle: {
    fontFamily: 'GothamPro-Medium',
    color: GStyle.fontColor,
    fontSize: 17,
    marginTop: 35,
  },

  notifyDescription: {
    fontFamily: 'GothamPro',
    color: GStyle.fontColor,
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 20,
  },

  elementLabel: {
    color: GStyle.grayColor,
    fontFamily: 'GothamPro-Medium',
    fontSize: 13,
  },

  image: {
    width: 56,
    height: undefined,
    aspectRatio: 1 / 1,
    resizeMode: 'contain',
  },

  buttonFill: {
    justifyContent: 'center',
    backgroundColor: GStyle.activeColor,
    borderRadius: GStyle.buttonRadius,
    width: BUTTON_WIDTH,
    height: 50,
  },

  textFill: {
    fontFamily: 'GothamPro-Medium',
    fontSize: 15,
    textAlign: 'center',
    color: 'white',
  },

  miniDot: {
    width: 3,
    height: 3,
    resizeMode: 'contain',
    marginHorizontal: 4,
  },
});

export default GStyle;
export {GStyles};
