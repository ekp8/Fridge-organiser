import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';
import { ScrollView } from 'react-native';

const categories = [
  'None', 'Meat', 'Vegetables', 'Fruits', 'Dairy', 'Drink', 'Leftover', 'Snack', 'Meal Prep', 'Herb'
];


const herbStorageOptions = [
  'None',
  'Covered',
  'Ziploc Bag',
  'Jar with Water',
  'Paper Towel in Bag',
];

const generalStorageOptions = [
  'None',
  'Unopened',
  'Covered',
  'Cling Wrap',
  'Ziploc Bag',
  'Vacuum sealed',
];

const fruitVegStorageOptions = [
    'Crisper Drawer',
  ...generalStorageOptions,
];

export default function AddItemModal({ visible, onClose, onAdd, shelves, editingItem }) {
  const [name, setName] = useState('');
  const [shelf, setShelf] = useState((shelves && shelves.length > 0) ? shelves[0] : '');
  const [category, setCategory] = useState('None');
  const [quantity, setQuantity] = useState(1);
  const [freshDays, setFreshDays] = useState(3);
  const [storage, setStorage] = useState('None');
  const [image, setImage] = useState(null);


  const [quantityInput, setQuantityInput] = useState('1');
  const [freshDaysInput, setFreshDaysInput] = useState('3');
  const [freshUnit, setFreshUnit] = useState('days');



  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setShelf(editingItem.shelf);
      setCategory(editingItem.category);
      setQuantity(editingItem.quantity);
      setQuantityInput(editingItem.quantity.toString());
      setStorage(editingItem.storage);

      // Calculate the best unit and value for freshness
      const expires = moment(editingItem.expires);
      const now = moment().startOf('day');
      let unit = 'days';
      let value = expires.diff(now, 'days');

      if (value % 7 === 0 && value >= 7) {
        unit = 'weeks';
        value = expires.diff(now, 'weeks');
      } else if (value % 30 === 0 && value >= 30) {
        unit = 'months';
        value = expires.diff(now, 'months');
      }

      setFreshDaysInput(value.toString());
      setFreshUnit(unit);
      setImage(editingItem.image || null);
    } else {
    setName('');
    setShelf((shelves && shelves.length > 0) ? shelves[0] : '');
    setCategory('None');
    setQuantity(1);
    setQuantityInput('1');
    setStorage('None');
    setFreshDays(3);
    setFreshDaysInput('3');
    setImage(null);
  }
}, [editingItem, visible]);




  const handleAdd = () => {
    const quantity = Math.max(1, parseInt(quantityInput, 10) || 1);
    const freshValue = Math.max(0, parseInt(freshDaysInput, 10) || 0);

    let expires = moment();
    if (freshUnit === 'days') {
      expires = expires.add(freshValue, 'days');
    } else if (freshUnit === 'weeks') {
      expires = expires.add(freshValue, 'weeks');
    } else if (freshUnit === 'months') {
      expires = expires.add(freshValue, 'months');
    }
    expires = expires.format('YYYY-MM-DD');

    if (!name.trim()) {
      alert('Please enter the item name.');
      return;
    }
    onAdd({
      id: editingItem ? editingItem.id : Date.now().toString(),
      name,
      shelf,
      category,
      quantity,
      storage,
      expires,
      image,
    });
    onClose();
  };



// Determine storage options based on category
  let availableStorageOptions = generalStorageOptions;
if (category === 'Vegetables' || category === 'Fruits') {
  availableStorageOptions = fruitVegStorageOptions;
} else if (category === 'Herb') {
  availableStorageOptions = herbStorageOptions;
}


  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>

      <View style={[styles.card, { borderColor: '#e0e0e0', borderWidth: 1 }]}>

          <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
          <Text style={styles.title}>Add Item</Text>
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <View style={styles.imageBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
          )}
        </View>

          <Text style={styles.label}>Shelf</Text>
          <Picker
            selectedValue={shelf}
            onValueChange={setShelf}
            style={styles.input}
          >
            {shelves.map((s) => (
              <Picker.Item key={s} label={s} value={s} />
            ))}
          </Picker>
          <Text style={styles.label}>Category</Text>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={styles.input}
          >
            {categories.map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>
          <Text style={styles.label}>Quantity</Text>
          
          {/* quantity row */}
        <Picker
          selectedValue={quantityInput}
           onValueChange={v => {
          setQuantityInput(v.toString());
          setQuantity(Number(v)); // <-- add this line
        }}
          style={styles.picker}
          mode="dropdown" // <-- Add this line
        >
          {[...Array(50)].map((_, i) => (
            <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
          ))}
        </Picker>


        {/* storage */}
          <Text style={styles.label}>Storage</Text>
            <Picker
              selectedValue={storage}
              onValueChange={setStorage}
              style={styles.input}
            >

              {availableStorageOptions.map((option) => (
  <Picker.Item key={option} label={option} value={option} />
))}
      </Picker>


          {/* Fresh up to days row */}
         
     <Text style={styles.label}>Fresh up to</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Picker
        selectedValue={freshDaysInput}
        onValueChange={v => setFreshDaysInput(v.toString())}
        style={{ flex: 2, height: 60, marginRight: 8 }}
        mode="dropdown"
      >
        {[...Array(31)].map((_, i) => (
          <Picker.Item key={i} label={`${i}`} value={`${i}`} />
        ))}
      </Picker>
        <Picker
          selectedValue={freshUnit}
          onValueChange={setFreshUnit}
          style={{ flex: 1, height: 60, minWidth: 90 }}
          mode="dropdown"
        >
          <Picker.Item label="days" value="days" />
          <Picker.Item label="weeks" value="weeks" />
          <Picker.Item label="months" value="months" />
        </Picker>
      </View>

     

      

          <TouchableOpacity onPress={handleAdd} style={styles.button}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 10 }}>
            <Text style={{ color: '#999' }}>Cancel</Text>
          </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}


// Add/adjust styles as needed

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#0005'
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 30,
    borderRadius: 12,
    maxHeight: '90%', // <-- add this line
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12
  },
  picker: {
    height: 59,
    minHeight: 36,
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#1890ff',
    padding: 10,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600'
  },
  imageBox: {
  alignItems: 'flex-start', // was 'center'
  marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
  color: '#aaa',
  fontSize: 12,
  fontStyle: 'italic',
},
  placeholder: {
    borderWidth: 1,
    borderColor: '#ccc',
  },

});

// This component provides a modal for adding new items to the fridge inventory.
// It includes fields for item name and shelf, and handles submission to add the item.