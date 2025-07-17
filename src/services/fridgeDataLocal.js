import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@fridge_items';

export const saveItems = async (items) => {
  try {
    const json = JSON.stringify(items);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.error('Error saving items:', e);
  }
};

export const loadItems = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json != null ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Error loading items:', e);
    return [];
  }
};

// New shelf/section functions
export async function loadShelves() {
  try {
    const json = await AsyncStorage.getItem('shelves');
    return json ? JSON.parse(json) : null;
  } catch (e) {
    return null;
  }
}

export async function saveShelves(sections) {
  try {
    await AsyncStorage.setItem('shelves', JSON.stringify(sections));
  } catch (e) {}
}

// You can now use saveItems() and loadItems() in your FridgeInventory screen to persist and retrieve your fridge contents.
// to add autosave functionality, you can call saveItems() whenever the items change, such as in a useEffect hook or after adding/removing items.