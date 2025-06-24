import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import moment from 'moment';


const getHighlightColors = (daysLeft) => {
  if (daysLeft <= 0) return { bg: '#ffeaea', text: '#ff4d4f' };      // pale red
  if (daysLeft <= 3) return { bg: '#fff7e6', text: '#faad14' };      // pale orange
  return { bg: '#e6f7ff', text: '#1890ff' };                         // pale blue/green
};


export default function ItemCard({ item, onSendToHistory, onEdit }) {
  const daysLeft = moment(item.expires).diff(moment(), 'days');
  const { bg, text } = getHighlightColors(daysLeft);
  // ...rest of your code...

  const getBorderColor = () => {
    if (daysLeft <= 0) return '#ff4d4f';
    if (daysLeft <= 3) return '#faad14';
    return '#1890ff';
  };

  return (
  <View style={[styles.card, { borderColor: '#e0e0e0', borderWidth: 1 }]}>
    {/* <View style={[styles.statusBar, { backgroundColor: getBorderColor() }]} /> */}
    {item.image ? (
      <Image source={{ uri: item.image }} style={styles.image} />
    ) : (
      <View style={styles.placeholder} />
    )}
    {/* pill style name */}
    <View style={styles.info}>
        <Text
          style={[
            styles.namePill,
            { backgroundColor: bg, color: text }
          ]}
        >
        {item.name}
      </Text> 
      <Text>Category: {item.category}</Text>
      <Text>Qty: {item.quantity}</Text>
      <Text>Storage: {item.storage}</Text>
      <Text style={styles.date}>
        Best before: {moment(item.expires).format('D MMM YYYY')}
      </Text>

            <View style={{ flexDirection: 'row', marginTop: 8 }}>
      <TouchableOpacity
        onPress={() => onEdit && onEdit(item)}
        style={[styles.actionBtn, styles.editBtn, { marginRight: 8 }]}
      >
        <Text style={styles.editBtnText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onSendToHistory && onSendToHistory(item)}
        style={[styles.actionBtn, styles.historyBtn]}
      >
        <Text style={styles.historyBtnText}>Send to History</Text>
      </TouchableOpacity>
    </View>

    </View>
  </View>
);

}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    position: 'relative',
  },
  statusBar: {
    width: 6,
    height: '100%',
    borderRadius: 4,
    marginRight: 10,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },

  namePill: {
  paddingHorizontal: 14,
  paddingVertical: 4,
  borderRadius: 999,
  fontWeight: 'bold',
  fontSize: 16,
  alignSelf: 'flex-start',
  marginBottom: 2,
  overflow: 'hidden',
},


actionBtn: {
  paddingVertical: 2,
  paddingHorizontal: 10,
  borderRadius: 999,
  minWidth: 0,
  alignItems: 'center',
  borderWidth: 0, // No border
  marginRight: 0,
},
editBtn: {
  backgroundColor: '#e3e0ff', // soft periwinkle
},
editBtnText: {
  color: '#5a4fcf',           // muted indigo
  fontWeight: 'bold',
  fontSize: 12,
},
historyBtn: {
  backgroundColor: '#e0f7f7', // soft aqua
},
historyBtnText: {
  color: '#2b7a78',           // teal
  fontWeight: 'bold',
  fontSize: 12,
},
  // ...other styles...
});