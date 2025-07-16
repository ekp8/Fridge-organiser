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





// This component manages the fridge inventory, allowing users to view and add items.
// It uses local storage to persist data and organizes items by shelf.

export default function FridgeInventory() {
  const [items, setItems] = useState([]);
  const [selectedShelf, setSelectedShelf] = useState('All');
  const [showModal, setShowModal] = useState(false);
// ...existing code...
const [openShelves, setOpenShelves] = useState([]); // <-- change from openShelf


//editing functionality
const [editingItem, setEditingItem] = useState(null);

const handleEdit = (item) => {
  setEditingItem(item);
  setShowModal(true);
};

const handleAddOrEdit = (newItem) => {
  if (editingItem) {
    // Edit mode: update item
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

const handleReduceServings = (item) => {
  if (typeof item.servings === 'number') {
    const updated = items.map(i =>
      i.id === item.id ? { ...i, servings: Math.max(0, i.servings - 1) } : i
    );
    setItems(updated);
    saveItems(updated);
  }
};

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


const showAllShelves = () => {
  setOpenShelves([...fridgeShelves, ...freezerShelves]);
};

const hideAllShelves = () => {
  setOpenShelves([]);
};
// ...existing code...

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
          quantity:3,
          storage: 'Covered',
          expires: moment().add(3, 'days').format('YYYY-MM-DD'),
          isSample: true,
        }
      ];


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
    saveItems(items);
  });
}, []);

  const addItem = (newItem) => {
    const updated = [...items, newItem];
    setItems(updated);
    saveItems(updated);
 
  };

  const groupedByShelf = (shelves) =>
    shelves.map((shelf) => ({
      shelf,
      items: items.filter((item) => item.shelf === shelf)
    }));

  const fridgeGroups = groupedByShelf(fridgeShelves);
  const freezerGroups = groupedByShelf(freezerShelves);
  const allGroups = [...fridgeGroups, ...freezerGroups];

  const filteredGroups =
    selectedShelf === 'All'
      ? allGroups
      : allGroups.filter((group) => group.shelf === selectedShelf);

  return (
  <View style={{ flex: 1 }}>
    {/* Remove the ShelfSelector here */}

    <TouchableOpacity onPress={() => setShowModal(true)} style={{ marginTop: 40, marginHorizontal: 16, marginBottom: 16 }}>
      <Text style={{ fontSize: 18, color: '#1890ff' }}>+ Add Item</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={openShelves.length === fridgeShelves.length + freezerShelves.length ? hideAllShelves : showAllShelves}
      style={{ marginHorizontal: 16, marginBottom: 8, alignSelf: 'flex-end' }}
    >
      <Text style={{ color: '#1890ff', fontWeight: 'bold' }}>
        {openShelves.length === fridgeShelves.length + freezerShelves.length ? 'Hide All' : 'Show All'}
      </Text>
    </TouchableOpacity>

    <ScrollView contentContainerStyle={styles.container}>
      {filteredGroups.map((group) => (
        <View key={group.shelf} style={styles.group}>
          <TouchableOpacity onPress={() => toggleShelf(group.shelf)} style={styles.pill}>
            <Text style={styles.shelfTitle}>
              {group.shelf} {openShelves.includes(group.shelf) ? '▼' : '►'}
            </Text>
          </TouchableOpacity>
          {openShelves.includes(group.shelf) && (
            <View style={styles.drawer}>
              {group.items.length > 0 ? (
                group.items.map((item) => (
                
                // item card component
                  <ItemCard
                  key={item.id}
                  item={item}
                   onEdit={handleEdit}
                  onSendToHistory={() => { /* implement later */ }}
                  onReduceServings={handleReduceServings}
                />
                ))
              ) : (
                <Text style={{ color: '#aaa', fontStyle: 'italic' }}>No items on this shelf</Text>
              )}
            </View>
          )}
        </View>
      ))}
    </ScrollView>

   <AddItemModal
  visible={showModal}
  onClose={() => { setShowModal(false); setEditingItem(null); }}
  onAdd={handleAddOrEdit}
  shelves={[...fridgeShelves, ...freezerShelves]}
  editingItem={editingItem}
/>
  </View>
);
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  shelfTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  group: { marginBottom: 12 },
  pill: {
  backgroundColor: '#e6f7ff',
  borderRadius: 20,
  paddingVertical: 10,
  paddingHorizontal: 18,
  marginBottom: 4,
  // Remove or comment out the next two lines:
  // borderWidth: 1,
  // borderColor: '#1890ff'
},
  drawer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    marginLeft: 8,
    marginRight: 8,
    // Optional: shadow for "drawer" effect
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  }
});
// This is the main fridge page that displays items organized by shelf.


