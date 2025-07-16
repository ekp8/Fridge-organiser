import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import { loadItems, saveItems } from '../services/fridgeDataLocal';
import ItemCard from '../components/ItemCard';
import AddItemModal from '../components/AddItemModal';
import ShelfSelector from '../components/ShelfSelector';
import DynamicFilterSelector from '../components/DynamicFilterSelector';

// ============================================================================
// CONSTANTS
// ============================================================================

const fridgeShelves = [
  'Top Shelf',
  'Middle Shelf',
  'Bottom Shelf',
  'Crisper Drawer',
  'Top Door Shelf',
  'Middle Door Shelf',
  'Bottom Door Shelf'
];

const freezerShelves = ['Freezer'];

// Sample items for demo/testing purposes
const sampleItems = [
  {
    id: 'sample1',
    name: 'Milk',
    shelf: 'Top Shelf',
    category: 'Dairy',
    quantity: 2,
    storage: 'Unopened',
    expires: moment().add(5, 'days').format('YYYY-MM-DD'),
    isSample: true,
  },
  {
    id: 'sample2',
    name: 'Beans',
    shelf: 'Top Shelf',
    category: 'Leftover',
    quantity: 3,
    storage: 'Covered',
    expires: moment().add(3, 'days').format('YYYY-MM-DD'),
    isSample: true,
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * FridgeInventory - Main component for managing fridge inventory
 * Features:
 * - View items organized by shelf with collapsible sections
 * - Filter items by category, storage type, and sort options
 * - Add, edit, and manage item servings
 * - Persistent local storage
 */
export default function FridgeInventory() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Item data state
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  
  // Filter state
  const [selectedShelf, setSelectedShelf] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStorage, setSelectedStorage] = useState('All');
  const [selectedSort, setSelectedSort] = useState('quantity-desc');
  
  // UI state
  const [showModal, setShowModal] = useState(false);
  const [openShelves, setOpenShelves] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  // ============================================================================
  // ITEM MANAGEMENT FUNCTIONS
  // ============================================================================

  /**
   * Handles editing an existing item
   * @param {Object} item - The item to edit
   */
  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  /**
   * Handles adding a new item or updating an existing one
   * @param {Object} newItem - The item data to add or update
   */
  const handleAddOrEdit = (newItem) => {
    if (editingItem) {
      // Edit mode: update existing item
      const updated = items.map(i => (i.id === editingItem.id ? { ...i, ...newItem } : i));
      setItems(updated);
      saveItems(updated);
    } else {
      // Add mode: add new item
      const updated = [...items, newItem];
      setItems(updated);
      saveItems(updated);
    }
    setEditingItem(null);
    setShowModal(false);
  };

  /**
   * Reduces the serving count of an item by 1 (minimum 0)
   * @param {Object} item - The item to reduce servings for
   */
  const handleReduceServings = (item) => {
    if (typeof item.servings === 'number') {
      const updated = items.map(i =>
        i.id === item.id ? { ...i, servings: Math.max(0, i.servings - 1) } : i
      );
      setItems(updated);
      saveItems(updated);
    }
  };

  /**
   * Legacy function - kept for backwards compatibility
   * @deprecated Use handleAddOrEdit instead
   */
  const addItem = (newItem) => {
    const updated = [...items, newItem];
    setItems(updated);
    saveItems(updated);
  };

  // ============================================================================
  // SHELF VISIBILITY FUNCTIONS
  // ============================================================================

  /**
   * Toggles the visibility of a specific shelf
   * @param {string} shelf - The shelf name to toggle
   */
  const toggleShelf = (shelf) => {
    // If all shelves are open, ignore individual shelf clicks
    if (openShelves.length === fridgeShelves.length + freezerShelves.length) {
      return;
    }
    // If this shelf is already open, close it
    if (openShelves.includes(shelf)) {
      setOpenShelves([]);
      return;
    }
    // Open only this shelf
    setOpenShelves([shelf]);
  };

  /**
   * Shows all shelves (expands all sections)
   */
  const showAllShelves = () => {
    setOpenShelves([...fridgeShelves, ...freezerShelves]);
  };

  /**
   * Hides all shelves (collapses all sections)
   */
  const hideAllShelves = () => {
    setOpenShelves([]);
  };

  // ============================================================================
  // DATA PROCESSING FUNCTIONS
  // ============================================================================

  /**
   * Groups items by shelf
   * @param {Array} shelves - Array of shelf names
   * @returns {Array} Array of objects with shelf and items properties
   */
  const groupedByShelf = (shelves) =>
    shelves.map((shelf) => ({
      shelf,
      items: filteredItems.filter((item) => item.shelf === shelf)
    }));

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Extract unique categories and storage types from items
  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)));
  const storages = Array.from(new Set(items.map(i => i.storage).filter(Boolean)));

  // Group items by shelf type
  const fridgeGroups = groupedByShelf(fridgeShelves);
  const freezerGroups = groupedByShelf(freezerShelves);
  const allGroups = [...fridgeGroups, ...freezerGroups];

  // Apply shelf filtering
  const filteredGroups = selectedShelf === 'All'
    ? allGroups
    : allGroups.filter((group) => group.shelf === selectedShelf);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Initialize component - load items from storage and add sample items if needed
   */
  useEffect(() => {
    loadItems().then(loaded => {
      let items = loaded || [];
      // Add sample items only if missing (by id)
      sampleItems.forEach(sample => {
        if (!items.some(i => i.id === sample.id)) {
          items.unshift(sample); // add to top
        }
      });
      setItems(items);
      setFilteredItems(items);
      saveItems(items);
    });
  }, []);

  /**
   * Keep filteredItems in sync when items change (e.g., add/delete)
   */
  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  /**
   * Apply filtering and sorting logic when filter criteria change
   */
  useEffect(() => {
    let filtered = items;
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(i => i.category === selectedCategory);
    }
    
    // Apply storage filter
    if (selectedStorage !== 'All') {
      filtered = filtered.filter(i => i.storage === selectedStorage);
    }
    
    // Apply sorting
    if (selectedSort.startsWith('quantity')) {
      filtered = [...filtered].sort((a, b) => 
        selectedSort.endsWith('desc') ? (b.quantity - a.quantity) : (a.quantity - b.quantity)
      );
    } else if (selectedSort.startsWith('servings')) {
      filtered = [...filtered].sort((a, b) => 
        selectedSort.endsWith('desc') ? (b.servings - a.servings) : (a.servings - b.servings)
      );
    } else if (selectedSort.startsWith('fresh')) {
      filtered = [...filtered].sort((a, b) => {
        const aDays = moment(a.expires).diff(moment(), 'days');
        const bDays = moment(b.expires).diff(moment(), 'days');
        return selectedSort.endsWith('desc') ? (bDays - aDays) : (aDays - bDays);
      });
    }
    
    setFilteredItems(filtered);
  }, [items, selectedCategory, selectedStorage, selectedSort]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={{ flex: 1 }}>


      {/* Category, storage, and sort filters */}

      <DynamicFilterSelector
        shelves={[...fridgeShelves, ...freezerShelves]}
        occupiedShelves={Array.from(new Set(items.map(i => i.shelf).filter(Boolean)))}
        categories={categories}
        storages={storages}
        onFilterChange={({ type, value, order }) => {
          // Reset all filters
          setSelectedShelf('All');
          setSelectedCategory('All');
          setSelectedStorage('All');
          setSelectedSort('quantity-desc');

          // Always show all shelves when any filter is selected
          setOpenShelves([...fridgeShelves, ...freezerShelves]);

          if (type === 'shelf') {
            setSelectedShelf(value);
          } else if (type === 'category') {
            setSelectedCategory(value);
          } else if (type === 'storage') {
            setSelectedStorage(value);
          } else if (['quantity', 'servings', 'fresh'].includes(type)) {
            setSelectedSort(`${type}-${order}`);
          }
        }}
      />

      {/* Add item button */}
      <TouchableOpacity 
        onPress={() => setShowModal(true)} 
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>+ Add Item</Text>
      </TouchableOpacity>

      {/* Show/Hide all shelves toggle */}
      <TouchableOpacity
        onPress={openShelves.length === fridgeShelves.length + freezerShelves.length ? hideAllShelves : showAllShelves}
        style={styles.toggleAllButton}
      >
        <Text style={styles.toggleAllButtonText}>
          {openShelves.length === fridgeShelves.length + freezerShelves.length ? 'Hide All' : 'Show All'}
        </Text>
      </TouchableOpacity>

      {/* Main inventory list */}
      <ScrollView contentContainerStyle={styles.container}>
        {filteredGroups.map((group) => (
          <View key={group.shelf} style={styles.group}>
            {/* Shelf header - clickable to toggle */}
            <TouchableOpacity onPress={() => toggleShelf(group.shelf)} style={styles.pill}>
              <Text style={styles.shelfTitle}>
                {group.shelf} {openShelves.includes(group.shelf) ? '▼' : '►'}
              </Text>
            </TouchableOpacity>
            
            {/* Shelf contents - shown when expanded */}
            {openShelves.includes(group.shelf) && (
              <View style={styles.drawer}>
                {group.items.length > 0 ? (
                  group.items.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onSendToHistory={() => { /* TODO: implement history feature */ }}
                      onReduceServings={handleReduceServings}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyShelfText}>No items on this shelf</Text>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Add/Edit item modal */}
      <AddItemModal
        visible={showModal}
        onClose={() => { 
          setShowModal(false); 
          setEditingItem(null); 
        }}
        onAdd={handleAddOrEdit}
        shelves={[...fridgeShelves, ...freezerShelves]}
        editingItem={editingItem}
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: { 
    padding: 16 
  },
  group: { 
    marginBottom: 12 
  },
  pill: {
    backgroundColor: '#e6f7ff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 4,
  },
  shelfTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 4 
  },
  drawer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    marginLeft: 8,
    marginRight: 8,
    // Shadow for "drawer" effect
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addButton: {
    marginTop: 40,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 18,
    color: '#1890ff',
  },
  toggleAllButton: {
    marginHorizontal: 16,
    marginBottom: 8,
    alignSelf: 'flex-end',
  },
  toggleAllButtonText: {
    color: '#1890ff',
    fontWeight: 'bold',
  },
  emptyShelfText: {
    color: '#aaa',
    fontStyle: 'italic',
  },
});
// This is the main fridge page that displays items organized by shelf.


