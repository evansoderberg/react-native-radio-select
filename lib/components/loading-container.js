import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

import PropTypes from "prop-types";
import React from "react";
import _ from "lodash";

export default class InfiniteListView extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    loadMoreData: PropTypes.func,
    moreDataAvailable: PropTypes.bool,
    dataIsLoading: PropTypes.bool
  };

  scrollToEnd() {
    this.list.scrollToEnd();
  }

  scrollToOffset(opts) {
    this.list.scrollToOffset(opts);
  }

  onEndReached = () => {
    this.loadMore();
  };

  loadMore() {
    if (this.props.loadMoreData) {
      if (this.props.moreDataAvailable && !this.props.dataIsLoading) {
        this.props.loadMoreData();
      }
    }
  }

  renderLoader = () =>
    this.props.dataIsLoading ? (
      <ActivityIndicator {...this.props.spinnerProps} />
    ) : null;

  renderLoaderContainer = () => (
    <View style={styles.loaderContainer}>{this.renderLoader()}</View>
  );

  render() {
    const flatListValidProps = _.keys(FlatList.propTypes);
    const flatListProps = _.pick(this.props, flatListValidProps);
    return (
      <FlatList
        style={styles.flatList}
        contentContainerStyle={this.props.contentContainerStyle}
        keyboardShouldPersistTaps="always"
        onEndReached={this.onEndReached}
        onEndReachedThreshold={0}
        refreshing={this.props.dataIsLoading}
        {...flatListProps}
        extraData={this.props.extraData}
        viewabilityConfig={this.props.viewabilityConfig}
        onViewableItemsChanged={this.props.onViewableItemsChanged}
        inverted={this.props.inverted}
        data={this.props.data}
        renderItem={this.props.renderItem}
        ListFooterComponent={this.renderLoaderContainer}
        ref={e => (this.list = e)}
      />
    );
  }
}

const styles = StyleSheet.create({
  loaderContainer: {
    height: 50,
    padding: 10
  },
  flatList: {
    flexGrow: 0
  }
});
