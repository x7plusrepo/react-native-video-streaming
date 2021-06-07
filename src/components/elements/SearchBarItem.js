import React, {Component} from 'react';
import {Image, StyleSheet,} from 'react-native';
import {SearchBar} from 'react-native-elements';

import {GStyles,} from '../../utils/Global';

const ic_search = require('../../assets/images/Icons/ic_search.png');

export default class SearchBarItem extends Component {
  constructor(props) {
    super(props);

    this.state = { searchText: '' };
  }

  onSearchFilter(text) {
    this.setState({ searchText: text });
    this.props.onChangeText(text);
  }

  onSearchSubmit = () => {
    this.props.onSubmitText();
  };

  searchImage = () => {
    return <Image source={ic_search} style={{ width: 16, height: 16 }} />;
  };

  render() {
    const { searchText } = this.props;

    return (
      <SearchBar
        lightTheme
        searchIcon={this.searchImage}
        onChangeText={(text) => this.onSearchFilter(text)}
        onClear={(text) => this.onSearchFilter('')}
        placeholder="Search"
        value={searchText}
        returnKeyType={'search'}
        onSubmitEditing={this.onSearchSubmit}
        autoCapitalize="none"
        inputStyle={GStyles.regularText}
        containerStyle={{
          ...GStyles.shadow,
          height: 48,
          backgroundColor: 'white',
          justifyContent: 'center',
          borderRadius: 32,
        }}
        inputContainerStyle={{
          backgroundColor: 'white',
          height: 44,
          borderRadius: 32,
        }}
        rightIconContainerStyle={{ paddingLeft: 4 }}
      />
    );
  }
}

const styles = StyleSheet.create({});
