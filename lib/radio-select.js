/**
 * inspiration from https://github.com/ataomega/react-native-multiple-select-list#readme
 */
import React, { Component, cloneElement } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import Icon from "react-native-vector-icons/FontAwesome";
import InfiniteListView from "./components";
import PropTypes from "prop-types";
import _ from "lodash";

export default class Selector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: null,
      selected: []
    };
    this.viewabilityConfig = { itemVisiblePercentThreshold: 50 };
  }

  componentDidMount = () => {
    const { selected } = this.props;
    if (!selected) return;
    selected.map(select => {
      this._onSelect(select);
    });
  };

  onChange = () => {
    this.props.onChange(this.state.selected);
  };

  _onSelectMutipleEnabled = item => {
    const { selected } = this.state;
    if (this._isSelected(item)) {
      // if item is already selected, remove it
      const newSelected = _.filter(selected, sel => sel.value !== item.value);
      this.setState({ selected: newSelected }, this.onChange);
    } else {
      // if item not already selected, add it
      const newSelected = selected.concat(item);
      this.setState({ selected: newSelected }, this.onChange);
    }
  };

  _onSelectMutipleDisabled = item => {
    const { selected } = this.state;
    if (this._isSelected(item)) {
      this.setState({ selected: [] }, this.onChange);
    } else {
      this.setState({ selected: [item] }, this.onChange);
    }
  };

  _onSelect = item => {
    const { selected } = this.state;
    if (this.props.multiple) {
      this._onSelectMutipleEnabled(item);
    } else {
      this._onSelectMutipleDisabled(item);
    }
  };

  _onSearch = text => {
    if (this.props.onSetSearch) {
      this.props.onSetSearch(text);
    }
    this.setState({
      searchText: text.length > 0 ? text.toLowerCase() : null
    });
  };

  _isSelected = item => {
    const { selected } = this.state;
    return Boolean(_.find(selected, sel => sel.value === item.value));
  };

  _filterItems = options => {
    const filteredItems = [];
    const { searchText } = this.state;
    const { asyncSearch } = this.props;
    if (!searchText || asyncSearch) return options;
    options.forEach(option => {
      const parts = searchText
        .replace(/[\^$\\.*+?()[\]{}|]/g, "\\$&")
        .trim()
        .split(" ");
      const regex = new RegExp(`(${parts.join("|")})`, "i");

      if (regex.test(option.label)) {
        filteredItems.push(option);
      }
    });
    return filteredItems;
  };

  keyExtractor = item => item.value;

  renderSearchComponent = () => {
    if (!this.props.searchable) return null;
    if (this.props.searchComponent) {
      return cloneElement(this.props.searchComponent, {
        onInputChange: this._onSearch
      });
    }
    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchIconContainer}>
          <Icon name="search" color="#00a2dd" size={25} />
        </View>
        <TextInput
          style={[
            styles.searchInput,
            {
              width: this.state.pageWidth - 20,
              borderColor: "#00a2dd"
            }
          ]}
          onChangeText={text => {
            this._onSearch(text);
          }}
          autoCorrect={false}
          clearButtonMode="always"
          placeholder={this.props.placeholder}
          placeholderTextColor="#757575"
          underlineColorAndroid="transparent"
        />
      </View>
    );
  };

  renderItem = ({ item }) => {
    if (this.props.itemComponent) {
      return this.props.itemComponent(item, this._onSelect, this._isSelected);
    }

    const iconDynamicStyle = {
      color: "#00a2dd",
      fontSize: 30
    };
    const rowDynamicStyles = {
      backgroundColor: "#eee",
      height: 50,
      borderRadius: 5
    };
    return (
      <TouchableOpacity
        key={`select-item-${item.value}`}
        style={[styles.item, rowDynamicStyles, this.props.itemStyle]}
        onPress={() => {
          this._onSelect(item);
        }}
      >
        <Text style={this.props.labelStyle}>{item.label}</Text>
        {this._isSelected(item) ? (
          <Icon
            name="check-circle"
            style={[iconDynamicStyle, this.props.selectedIconStyle]}
          />
        ) : (
          <Icon
            name="circle-o"
            style={[iconDynamicStyle, this.props.unselectedIconStyle]}
          />
        )}
      </TouchableOpacity>
    );
  };

  renderPlaceholder = ({ item }) => <View key={item} />;

  render() {
    let data;
    let renderItemFunc;
    if (!this.props.options) {
      data = _.range(0, 20);
      renderItemFunc = this.renderPlaceholder;
    } else {
      data = this.props.getOptions(this.props.options);
      data = this._filterItems(data);
      renderItemFunc = this.renderItem;
    }
    return (
      <View>
        {this.renderSearchComponent()}
        <InfiniteListView
          contentContainerStyle={styles.contentContainer}
          ref={flatList => (this.flatList = flatList)}
          data={data}
          keyExtractor={this.keyExtractor}
          renderItem={renderItemFunc}
          extraData={this.state.selected.length}
          loadMoreData={this.props.loadMoreData}
          moreDataAvailable={this.props.moreDataAvailable}
          dataIsLoading={this.props.dataIsLoading}
          viewabilityConfig={this.viewabilityConfig}
          onViewableItemsChanged={this.onViewableItemsChanged}
        />
      </View>
    );
  }
}

Selector.PropTypes = {
  options: PropTypes.array.isRequired, // Array in form [{label: 'the label', value: 1234}]
  multiple: PropTypes.bool, // Can you select multiple options, or just one?
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired, // Called when user changes selection
  onSetSearch: PropTypes.func
};

const styles = StyleSheet.create({
  item: {
    padding: 7,
    marginTop: 0,
    marginLeft: 2,
    marginRight: 2,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  optionsContainer: {
    padding: 5
  },
  searchContainer: {
    flexDirection: "row",
    height: 55
  },
  searchInput: {
    height: 35,
    margin: 0,
    marginTop: 10,
    marginLeft: -25,
    padding: 5,
    paddingLeft: 30,

    borderWidth: 1,
    borderRadius: 5
  },
  searchIconContainer: {
    marginTop: 15,
    marginLeft: 15,
    backgroundColor: "transparent"
  }
});
