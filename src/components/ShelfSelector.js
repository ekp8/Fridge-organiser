/**
 * ShelfSelector Component
 *
 * Displays fridge/freezer sections and their shelves, allowing users to:
 * - Toggle shelves open/closed to view items
 * - Click section headers to filter or reset shelf views
 * - Edit, send to history, or reduce servings for items via ItemCard
 *
 * Props:
 * - sections: Array of section objects, each with a title and shelves
 * - openShelves: Array of shelf names currently open
 * - setOpenShelves: Function to update open shelves
 * - onSectionFilter: Handler for section header clicks (parent controls logic)
 * - onEdit, onSendToHistory, onReduceServings: Item actions
 *
 * UI:
 * - Minimalistic section headers
 * - Collapsible shelf groups
 * - Drawer-style item display
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Expects props:
// sections: [
//   { title: 'Main', shelves: [ { name: 'Top Shelf', items: [...] }, ... ] },
//   { title: 'Door', shelves: [...] },
//   { title: 'Freezer', shelves: [...] }
// ]
//
// Optionally: onEdit, onSendToHistory, onReduceServings (passed to ItemCard)
import ItemCard from './ItemCard';

const ShelfSelector = ({
  sections,
  openShelves,
  setOpenShelves,
  onSectionFilter,
  onEdit,
  onSendToHistory,
  onReduceServings
}) => {
  // Section and shelf toggling logic
  const handleSectionToggle = (sectionTitle) => {
    // Let the parent component handle all the logic for section filtering
    if (onSectionFilter) onSectionFilter(sectionTitle);
  };

  const handleShelfToggle = (shelfName) => {
    if (openShelves.includes(shelfName)) {
      setOpenShelves(openShelves.filter((s) => s !== shelfName));
    } else {
      setOpenShelves([...openShelves, shelfName]);
    }
  };

  return (
    <View style={{ padding: 8 }}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <TouchableOpacity
              onPress={() => handleSectionToggle(section.title)}
              style={styles.sectionHeaderTouchable}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionHeader}>{section.title}</Text>
            </TouchableOpacity>
            {section.shelves.map((shelf) => (
              <View key={shelf.shelf} style={styles.group}>
                <TouchableOpacity onPress={() => handleShelfToggle(shelf.shelf)} style={styles.sectionHeader}>
                  <Text style={styles.shelfTitle}>
                    {openShelves.includes(shelf.shelf) ? '▼' : '►'} {shelf.shelf}
                  </Text>
                </TouchableOpacity>
                {openShelves.includes(shelf.shelf) && (
                  <View style={styles.drawer}>
                    {shelf.items.length > 0 ? (
                      shelf.items.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          onEdit={onEdit}
                          onSendToHistory={onSendToHistory}
                          onReduceServings={onReduceServings}
                        />
                      ))
                    ) : (
                      <Text style={styles.emptyShelfText}>No items on this shelf</Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 18,
  },
  sectionHeaderTouchable: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#e3f1ff',
    marginBottom: 6,
    marginLeft: 2,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1765ad',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1765ad',
    letterSpacing: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  group: {
    marginBottom: 12,
  },
  // Card outline style for section headers
  sectionHeader: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  shelfTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  drawer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    marginLeft: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyShelfText: {
    color: '#aaa',
    fontStyle: 'italic',
  },
});

export default ShelfSelector;