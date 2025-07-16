import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ShelfSelector = ({ shelves, selected, onSelect, items, onFilter }) => {
  const [filteredItems, setFilteredItems] = useState(items || []);

  useEffect(() => {
    if (!items) return;
    if (selected === 'All') {
      setFilteredItems(items);
      onFilter && onFilter(items);
    } else {
      const filtered = items.filter(item => item.shelf === selected);
      setFilteredItems(filtered);
      onFilter && onFilter(filtered);
    }
  }, [selected, items, onFilter]);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>Filter by shelf:</Text>
      <Picker
        selectedValue={selected}
        onValueChange={onSelect}
        style={styles.picker}
      >
        <Picker.Item label="All" value="All" />
        {shelves.map((shelf) => (
          <Picker.Item key={shelf} label={shelf} value={shelf} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  picker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    height: 44,
  },
});

export default ShelfSelector;