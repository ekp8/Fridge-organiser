import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const filterOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Shelf', value: 'shelf' },
  { label: 'Category', value: 'category' },
  { label: 'Storage', value: 'storage' },
  { label: 'Quantity', value: 'quantity' },
  { label: 'Servings', value: 'servings' },
  { label: 'Fresh days left', value: 'fresh' },
];

const sortOrders = [
  { label: 'High to Low', value: 'desc' },
  { label: 'Low to High', value: 'asc' },
];

// To show only shelves that have items, we need to receive a list of occupied shelves from the parent (FridgeInventory)
// We'll add an optional prop: occupiedShelves
const DynamicFilterSelector = ({
  shelves = [],
  occupiedShelves = [],
  categories = [],
  storages = [],
  onFilterChange,
}) => {
  const [filterType, setFilterType] = useState('default');
  const [filterValue, setFilterValue] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');

  // Get options for the second dropdown based on filterType
  let valueOptions = [];
  if (filterType === 'default') {
    valueOptions = [{ label: 'All', value: 'All' }];
  } else if (filterType === 'shelf') {
    // Only show shelves that actually have items (occupiedShelves)
    const shelfList = (occupiedShelves && occupiedShelves.length > 0)
      ? occupiedShelves
      : shelves;
    valueOptions = [{ label: 'All', value: 'All' }, ...shelfList.filter(s => typeof s === 'string' && s.trim().length > 0).map(s => ({ label: s, value: s }))];
  } else if (filterType === 'category') {
    valueOptions = [{ label: 'All', value: 'All' }, ...categories.map(c => ({ label: c, value: c }))];
  } else if (filterType === 'storage') {
    valueOptions = [{ label: 'All', value: 'All' }, ...storages.map(s => ({ label: s, value: s }))];
  } else if (['quantity', 'servings', 'fresh'].includes(filterType)) {
    valueOptions = sortOrders;
  }

  // Handle changes
  const handleTypeChange = (type) => {
    setFilterType(type);
    // Reset value and sort order
    if (type === 'default') {
      setFilterValue('All');
      setSortOrder('desc');
      onFilterChange && onFilterChange({ type: 'default', value: 'All' });
    } else if (['quantity', 'servings', 'fresh'].includes(type)) {
      setFilterValue('desc');
      setSortOrder('desc');
      onFilterChange && onFilterChange({ type, order: 'desc' });
    } else {
      setFilterValue('All');
      setSortOrder('desc');
      onFilterChange && onFilterChange({ type, value: 'All' });
    }
  };

  const handleValueChange = (value) => {
    setFilterValue(value);
    if (['quantity', 'servings', 'fresh'].includes(filterType)) {
      setSortOrder(value);
      onFilterChange && onFilterChange({ type: filterType, order: value });
    } else {
      onFilterChange && onFilterChange({ type: filterType, value });
    }
  };

  return (
    <View style={styles.gradientBg}>
      <View style={styles.filterBar}>
        <MaterialIcons name="filter-list" size={22} color="#1890ff" style={{ marginRight: 6, marginLeft: 2 }} />
        <Text style={styles.filterLabel}>Filter</Text>
        <Picker
          selectedValue={filterType}
          onValueChange={handleTypeChange}
          style={styles.smallerPicker}
          dropdownIconColor="#1890ff"
        >
          {filterOptions.map(opt => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
        <Picker
          selectedValue={filterValue}
          onValueChange={handleValueChange}
          style={styles.smallerPicker}
          dropdownIconColor="#1890ff"
        >
          {valueOptions.map(opt => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
        <Text style={styles.spacer}></Text>
        <Text
          style={styles.defaultButton}
          onPress={() => {
            setFilterType('default');
            setFilterValue('All');
            setSortOrder('desc');
            onFilterChange && onFilterChange({ type: 'default', value: 'All' });
          }}
        >
          Default
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    // Use a solid color for all platforms for compatibility
    backgroundColor: '#e3f0ff',
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 18,
    marginTop: 8,
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#b3d1fa',
    minHeight: 40,
    gap: 10,
    shadowColor: '#b3c6e6',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 3,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1765ad',
    marginRight: 8,
    letterSpacing: 0.4,
  },
  smallerPicker: {
    flex: 1,
    minWidth: 90,
    maxWidth: 140,
    height: 34,
    backgroundColor: '#fafdff',
    borderRadius: 10,
    fontSize: 14,
    marginRight: 6,
    marginLeft: 0,
    borderWidth: 1.2,
    borderColor: '#b3d1fa',
    color: '#1a2a3a',
  },
  spacer: {
    flex: 1,
  },
  defaultButton: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    paddingVertical: 7,
    paddingHorizontal: 22,
    borderRadius: 20,
    backgroundColor: '#1890ff',
    overflow: 'hidden',
    marginLeft: 8,
    borderWidth: 1.2,
    borderColor: '#1576c2',
    letterSpacing: 0.5,
    shadowColor: '#1890ff',
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default DynamicFilterSelector;
