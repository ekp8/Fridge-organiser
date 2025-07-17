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
import { loadShelves, saveShelves } from '../services/fridgeDataLocal';
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
  // Track filter field selection order
  const [filterStep, setFilterStep] = useState(0); // 0: none, 1: first field, 2: second field
  
  // UI state
  const [showModal, setShowModal] = useState(false);
  const [openShelves, setOpenShelves] = useState([]); // Start with all shelves closed
  const [editingItem, setEditingItem] = useState(null);
  
  // Function to exit rename mode in ShelfSelector
  const [exitRenameFunction, setExitRenameFunction] = useState(null);

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

  // Build sections for ShelfSelector
  const [sections, setSections] = useState([
  {
    title: 'Main',
    shelves: fridgeGroups.filter(g => !g.shelf.includes('Door')),
  },
  {
    title: 'Door',
    shelves: fridgeGroups.filter(g => g.shelf.includes('Door')),
  },
  {
    title: 'Freezer',
    shelves: freezerGroups,
  },
]);

// Load shelves/sections from storage on mount
useEffect(() => {
  const initializeSections = async () => {
    try {
      const storedSections = await loadShelves();
      console.log('Loaded sections from storage:', storedSections);
      
      if (storedSections && Array.isArray(storedSections) && storedSections.length > 0) {
        // Validate that each section has the required structure
        const validSections = storedSections.every(section => 
          section && section.title && Array.isArray(section.shelves)
        );
        if (validSections) {
          setSections(storedSections);
          return;
        } else {
          console.log('Invalid sections structure, using defaults');
        }
      } else {
        console.log('No stored sections found, using defaults');
      }
      
      // Use defaults - create static shelf objects
      const defaultSections = [
        {
          title: 'Main',
          shelves: fridgeShelves.filter(shelf => !shelf.includes('Door')).map(shelf => ({ shelf, items: [] })),
        },
        {
          title: 'Door', 
          shelves: fridgeShelves.filter(shelf => shelf.includes('Door')).map(shelf => ({ shelf, items: [] })),
        },
        {
          title: 'Freezer',
          shelves: freezerShelves.map(shelf => ({ shelf, items: [] })),
        },
      ];
      setSections(defaultSections);
      
    } catch (error) {
      console.error('Error loading shelves:', error);
      // Fall back to defaults on error
      const defaultSections = [
        {
          title: 'Main',
          shelves: fridgeShelves.filter(shelf => !shelf.includes('Door')).map(shelf => ({ shelf, items: [] })),
        },
        {
          title: 'Door',
          shelves: fridgeShelves.filter(shelf => shelf.includes('Door')).map(shelf => ({ shelf, items: [] })),
        },
        {
          title: 'Freezer',
          shelves: freezerShelves.map(shelf => ({ shelf, items: [] })),
        },
      ];
      setSections(defaultSections);
    }
  };
  
  initializeSections();
}, []);

// Update sections with current filtered items
useEffect(() => {
  setSections(prevSections => 
    prevSections.map(section => ({
      ...section,
      shelves: section.shelves.map(shelfGroup => ({
        ...shelfGroup,
        items: filteredItems.filter(item => item.shelf === shelfGroup.shelf)
      }))
    }))
  );
}, [filteredItems]);
  // Keep sections in sync with items
  // Remove automatic rebuilding of sections from items

  // Apply shelf filtering
  // Section and shelf filtering logic
  let filteredSections = sections;
  if (selectedShelf && selectedShelf !== 'All') {
    // If selectedShelf matches a section title, show all shelves in that section
    const section = sections.find(section => section.title === selectedShelf);
    if (section) {
      filteredSections = [section];
    } else {
      // If selectedShelf matches a shelf name, show only that shelf in its section
      filteredSections = sections
        .map(section => ({
          ...section,
          shelves: section.shelves.filter(g => g.shelf === selectedShelf)
        }))
        .filter(section => section.shelves.length > 0);
    }
  }

  // Helper to get all shelf names in filteredSections
  const getAllFilteredShelves = () => {
    return filteredSections.flatMap(section => section.shelves.map(g => g.shelf));
  };

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
        occupiedShelves={fridgeShelves.concat(freezerShelves).filter(shelf => items.some(i => i.shelf === shelf))}
        categories={categories}
        storages={storages}
        onFilterChange={({ type, value, order }) => {
          // Exit rename mode when any filter is changed
          if (exitRenameFunction) {
            exitRenameFunction();
          }
          
          // Handle shelf selection differently - it immediately changes view
          if (type === 'shelf') {
            setSelectedShelf(value);
            setSelectedCategory('All');
            setSelectedStorage('All');
            setSelectedSort('quantity-desc');
            setFilterStep(0); // Reset filter step when changing shelf/section
            if (value === 'All') {
              setOpenShelves([]);
            } else {
              setOpenShelves(getAllFilteredShelves());
            }
            return;
          }

          // For non-shelf filters, handle the two-step behavior
          if (filterStep === 0) {
            // Check if this is a default value - if so, reset immediately
            if (value === 'All' || (type === 'quantity' && order === 'desc')) {
              // Reset everything to defaults
              setSelectedShelf('All');
              setSelectedCategory('All');
              setSelectedStorage('All');
              setSelectedSort('quantity-desc');
              setOpenShelves([]);
              setFilterStep(0);
              return;
            }
            
            // First field selection - update filter state but don't reset shelf view
            if (type === 'category') {
              setSelectedCategory(value);
            } else if (type === 'storage') {
              setSelectedStorage(value);
            } else if (['quantity', 'servings', 'fresh'].includes(type)) {
              setSelectedSort(`${type}-${order}`);
            }
            setFilterStep(1);
            // Don't change shelf view or open/close shelves yet
          } else {
            // Check if this is a default value - if so, reset immediately
            if (value === 'All' || (type === 'quantity' && order === 'desc')) {
              // Reset everything to defaults
              setSelectedShelf('All');
              setSelectedCategory('All');
              setSelectedStorage('All');
              setSelectedSort('quantity-desc');
              setOpenShelves([]);
              setFilterStep(0);
              return;
            }
            
            // Second field selection - apply the filter and shelf behavior
            if (type === 'category') {
              setSelectedCategory(value);
            } else if (type === 'storage') {
              setSelectedStorage(value);
            } else if (['quantity', 'servings', 'fresh'].includes(type)) {
              setSelectedSort(`${type}-${order}`);
            }
            
            // For non-default values, stay in current section/shelf view
            // Only open shelves that have filtered items
            setOpenShelves(getAllFilteredShelves());
          }
        }}
      />

      {/* Add item button */}
      <TouchableOpacity 
        onPress={() => {
          // Exit rename mode when adding item
          if (exitRenameFunction) {
            exitRenameFunction();
          }
          setShowModal(true);
        }} 
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>+ Add Item</Text>
      </TouchableOpacity>

      {/* Show/Hide all shelves toggle */}
      <TouchableOpacity
        onPress={() => {
          // Exit rename mode when toggling show/hide all
          if (exitRenameFunction) {
            exitRenameFunction();
          }
          
          if (openShelves.length === getAllFilteredShelves().length) {
            setOpenShelves([]);
          } else {
            setOpenShelves(getAllFilteredShelves());
          }
        }}
        style={styles.toggleAllButton}
      >
        <Text style={styles.toggleAllButtonText}>
          {openShelves.length === getAllFilteredShelves().length ? 'Hide All' : 'Show All'}
        </Text>
      </TouchableOpacity>

      {/* Main inventory list handled by ShelfSelector, now scrollable */}
      <ScrollView contentContainerStyle={styles.container}>
        {filteredSections.length === 0 || filteredSections.every(section => section.shelves.length === 0) ? (
          <Text style={styles.emptyShelfText}>No items on this shelf</Text>
        ) : (
          <ShelfSelector
            sections={filteredSections}
            openShelves={openShelves}
            setOpenShelves={setOpenShelves}
            onSectionFilter={(sectionTitle) => {
              // Exit rename mode when section is filtered
              if (exitRenameFunction) {
                exitRenameFunction();
              }
              const section = sections.find(s => s.title === sectionTitle);
              const sectionShelves = section ? section.shelves.map(g => g.shelf) : [];
              if (selectedShelf === 'All') {
                const anySectionOpen = sectionShelves.some(shelf => openShelves.includes(shelf));
                if (anySectionOpen) {
                  setOpenShelves([]);
                } else {
                  setSelectedShelf(sectionTitle);
                  setOpenShelves(sectionShelves);
                  setFilterStep(0);
                }
              } else if (selectedShelf === sectionTitle) {
                setSelectedShelf('All');
                setSelectedCategory('All');
                setSelectedStorage('All');
                setSelectedSort('quantity-desc');
                setOpenShelves([]);
                setFilterStep(0);
              } else {
                setSelectedShelf(sectionTitle);
                setOpenShelves(sectionShelves);
                setFilterStep(0);
              }
            }}
            onEdit={handleEdit}
            onReduceServings={handleReduceServings}
            // Rename section callback
            onRenameSection={(sectionIdx, newTitle) => {
              const newSections = [...sections];
              newSections[sectionIdx] = {
                ...newSections[sectionIdx],
                title: newTitle
              };
              setSections(newSections);
              saveShelves(newSections);
            }}
            // Rename shelf callback
            onRenameShelf={(sectionIdx, shelfIdx, newShelfName) => {
              const newSections = [...sections];
              const shelves = [...newSections[sectionIdx].shelves];
              shelves[shelfIdx] = {
                ...shelves[shelfIdx],
                shelf: newShelfName
              };
              newSections[sectionIdx].shelves = shelves;
              setSections(newSections);
              saveShelves(newSections);
            }}
            // Move section up
            onMoveSectionUp={(idx) => {
              if (idx > 0) {
                const newSections = [...sections];
                [newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]];
                setSections(newSections);
                saveShelves(newSections);
              }
            }}
            // Move section down
            onMoveSectionDown={(idx) => {
              if (idx < sections.length - 1) {
                const newSections = [...sections];
                [newSections[idx], newSections[idx + 1]] = [newSections[idx + 1], newSections[idx]];
                setSections(newSections);
                saveShelves(newSections);
              }
            }}
            // Move shelf up
            onMoveShelfUp={(sectionIdx, shelfIdx) => {
              const newSections = [...sections];
              const shelves = [...newSections[sectionIdx].shelves];
              if (shelfIdx > 0) {
                [shelves[shelfIdx - 1], shelves[shelfIdx]] = [shelves[shelfIdx], shelves[shelfIdx - 1]];
                newSections[sectionIdx].shelves = shelves;
                setSections(newSections);
                saveShelves(newSections);
              }
            }}
            // Move shelf down
            onMoveShelfDown={(sectionIdx, shelfIdx) => {
              const newSections = [...sections];
              const shelves = [...newSections[sectionIdx].shelves];
              if (shelfIdx < shelves.length - 1) {
                [shelves[shelfIdx], shelves[shelfIdx + 1]] = [shelves[shelfIdx + 1], shelves[shelfIdx]];
                newSections[sectionIdx].shelves = shelves;
                setSections(newSections);
                saveShelves(newSections);
              }
            }}
            onExitRename={(exitFn) => {
              setExitRenameFunction(() => exitFn);
            }}
          />
        )}
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

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  group: { 
    marginBottom: 12 
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
// It includes features for filtering, sorting, and managing items in the fridge and freezer.


