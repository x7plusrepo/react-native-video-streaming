import React from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import LiveStreamRoom from './LiveStreamRoom';

import { Helper, Constants, RestAPI } from '../../utils/Global/index';
import styles from './styles';

class LiveStreamRooms extends React.Component {
  constructor(props) {
    super(props);

    console.log('LiveStreamRoom start');
    this._isMounted = false;

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;
    this.onRefresh('init');
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.keyword) {
      if (prevProps.keyword !== this.props.keyword) {
        this.setState({ keyword: this.props.keyword }, () => {
          this.onRefresh('init');
        });
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  init = () => {
    this.state = {
      isFetching: false,
      totalCount: 0,
      curPage: 1,

      itemDatas: [],

      minVisibleIndex: 0,
      maxVisibleIndex: 0,
      onEndReachedCalledDuringMomentum: true,
    };
  };

  onRefresh = (type) => {
    let { isFetching, totalCount, curPage, itemDatas } = this.state;
    const { keyword } = this.props;

    if (isFetching) {
      return;
    }

    if (type === 'more') {
      curPage += 1;
      const maxPage =
        (totalCount + Constants.COUNT_PER_PAGE - 1) / Constants.COUNT_PER_PAGE;
      if (curPage > maxPage) {
        return;
      }
    } else {
      curPage = 1;
    }
    this.setState({ curPage, onEndReachedCalledDuringMomentum: true });

    if (type === 'init') {
      showPageLoader(true);
    } else {
      this.setState({ isFetching: true });
    }
    let params = {
      user_id: global.me ? global.me.id : '',
      page_number: type === 'more' ? curPage : '1',
      count_per_page: Constants.COUNT_PER_PAGE,
      keyword,
    };
    RestAPI.get_liveStream_list(params, (json, err) => {
      if (type === 'init') {
        showPageLoader(false);
      } else {
        if (this._isMounted) {
          this.setState({ isFetching: false });
        }
      }

      if (err !== null) {
        Helper.alertNetworkError(err?.message);
      } else {
        if (json.status === 200) {
          if (this._isMounted) {
            this.setState({ totalCount: json.data.totalCount });
            if (type === 'more') {
              let data = itemDatas.concat(json.data.rooms || []);
              this.setState({ itemDatas: data });
            } else {
              this.setState({ itemDatas: json.data.rooms });
            }
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  scrollToTop = () => {
    this.flatListRef.scrollToOffset({ animated: false, offset: 0 });
  };

  render() {
    const { isFetching, itemDatas } = this.state;

    return (
      <FlatList
        ref={(ref) => {
          this.flatListRef = ref;
        }}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        onRefresh={() => {
          this.onRefresh('pull');
        }}
        refreshing={isFetching}
        ListFooterComponent={this._renderFooter}
        onEndReachedThreshold={0.4}
        onMomentumScrollBegin={() => {
          this.setState({ onEndReachedCalledDuringMomentum: false });
        }}
        onEndReached={() => {
          if (!this.state.onEndReachedCalledDuringMomentum) {
            this.setState({ onEndReachedCalledDuringMomentum: true });
            this.onRefresh('more');
          }
        }}
        data={[...itemDatas, ...itemDatas]}
        renderItem={this._renderItem}
        contentContainerStyle={styles.flatListContentContainer}
        keyExtractor={(item, index) => `${item.id}-${index}`}
      />
    );
  }

  _renderFooter = () => {
    const { isFetching } = this.state;

    if (!isFetching) {
      return null;
    }

    return <ActivityIndicator style={{ color: '#000' }} />;
  };

  _renderItem = ({ item, index }) => {
    return <LiveStreamRoom room={item} index={index} />;
  };
}

export default LiveStreamRooms;
