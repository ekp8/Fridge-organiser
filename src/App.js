import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


import Fridge from './src/pages/Fridge';

export default function App() {
  return <Fridge />;
}

