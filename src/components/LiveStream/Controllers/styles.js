import { StyleSheet } from 'react-native';
import { GStyles } from '../../../utils/Global/Styles';

const styles = StyleSheet.create({
    wrapper: {
      marginTop: 8
    },
    gradient: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        padding: 10,
        overflow: 'hidden'
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: 'white'
    },
});

export default styles;
