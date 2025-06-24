import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';

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
  'Covered',
  'Ziploc Bag',
  'Cling Wrap'
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
  const [storage, setStorage] = useState('');
  const [image, setImage] = useState(null);


  const [quantityInput, setQuantityInput] = useState('1');
  const [freshDaysInput, setFreshDaysInput] = useState('3');



  useEffect(() => {
  if (editingItem) {
    setName(editingItem.name);
    setShelf(editingItem.shelf);
    setCategory(editingItem.category);
    setQuantity(editingItem.quantity);
    setQuantityInput(editingItem.quantity.toString());
    setStorage(editingItem.storage);
    const days = moment(editingItem.expires).diff(moment(), 'days');
    setFreshDays(days);
    setFreshDaysInput(days.toString());
    setImage(editingItem.image || null);
  } else {
    setName('');
    setShelf((shelves && shelves.length > 0) ? shelves[0] : '');
    setCategory('None');
    setQuantity(1);
    setQuantityInput('1');
    setStorage('');
    setFreshDays(3);
    setFreshDaysInput('3');
    setImage(null);
  }
}, [editingItem, visible]);




const handleAdd = () => {
  const quantity = Math.max(1, parseInt(quantityInput, 10) || 1);
  const freshDays = Math.max(1, parseInt(freshDaysInput, 10) || 1);
  if (!name.trim()) {
    alert('Please enter the item name.');
    return;
  }
  const expires = moment().add(freshDays, 'days').format('YYYY-MM-DD');
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
  // ...reset fields as before...
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
        <View style={styles.card}>
          <Text style={styles.title}>Add Item</Text>
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
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
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => {
                const newQty = Math.max(1, (parseInt(quantityInput, 10) || 1) - 1);
                setQuantityInput(newQty.toString());
              }}
              style={styles.incBtn}
            >
              <Text>-</Text>
            </TouchableOpacity>
            <TextInput
              value={quantityInput}
              onChangeText={v => setQuantityInput(v.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              style={[styles.input, { flex: 1, marginHorizontal: 8 }]}
            />
            <TouchableOpacity
              onPress={() => {
                const newQty = (parseInt(quantityInput, 10) || 1) + 1;
                setQuantityInput(newQty.toString());
              }}
              style={styles.incBtn}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>


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
          <Text style={styles.label}>Fresh up to (days)</Text>
          
            <View style={styles.row}>
            <TouchableOpacity
              onPress={() => {
                const newDays = Math.max(1, (parseInt(freshDaysInput, 10) || 1) - 1);
                setFreshDaysInput(newDays.toString());
              }}
              style={styles.incBtn}
            >
              <Text>-</Text>
            </TouchableOpacity>
            <TextInput
              value={freshDaysInput}
              onChangeText={v => setFreshDaysInput(v.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              style={[styles.input, { flex: 1, marginHorizontal: 8 }]}
            />
            <TouchableOpacity
              onPress={() => {
                const newDays = (parseInt(freshDaysInput, 10) || 1) + 1;
                setFreshDaysInput(newDays.toString());
              }}
              style={styles.incBtn}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
          
              

      

          <TouchableOpacity onPress={handleAdd} style={styles.button}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 10 }}>
            <Text style={{ color: '#999' }}>Cancel</Text>
          </TouchableOpacity>
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
    borderRadius: 12
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
  button: {
    backgroundColor: '#1890ff',
    padding: 10,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600'
  }
});

// This component provides a modal for adding new items to the fridge inventory.
// It includes fields for item name and shelf, and handles submission to add the item.