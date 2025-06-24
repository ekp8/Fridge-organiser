import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ShelfSelector = ({ shelves, selected, onSelect }) => (
  <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
    {['All', ...shelves].map((shelf) => (
      <TouchableOpacity
        key={shelf}
        style={[
          styles.pill,
          selected === shelf && styles.selectedPill
        ]}
        onPress={() => onSelect(shelf)}
      >
        <Text style={[styles.pillText, selected === shelf && styles.selectedText]}>
          {shelf}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 10
    // Optionally: height: '100%' if you want it to fill the parent vertically
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
    marginBottom: 10 // vertical spacing
  },
  selectedPill: {
    backgroundColor: '#1890ff',
    borderColor: '#1890ff'
  },
  pillText: {
    fontSize: 14,
    color: '#333'
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default ShelfSelector;