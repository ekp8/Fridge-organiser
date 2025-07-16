import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import moment from 'moment';


const getHighlightColors = (daysLeft) => {
  if (daysLeft < 1) return { bg: '#ffeaea', text: '#ff4d4f' };      // pale red
  if (daysLeft < 3) return { bg: '#fff7e6', text: '#faad14' };      // pale orange
  return { bg: '#e6f7ff', text: '#1890ff' };                         // pale blue/green
};

function getStatusText(daysLeft) {
  if (daysLeft < 1) return "Expires today";
  if (daysLeft < 4) return "Expires soon";
  return "Still fresh";
}


export default function ItemCard({ item, onSendToHistory, onEdit, onReduceServings }) {
  const daysLeft = moment(item.expires).startOf('day').diff(moment().startOf('day'), 'days');
  const { bg, text } = getHighlightColors(daysLeft);
  // ...rest of your code...

  //deprecated
  const getBorderColor = () => {
    if (daysLeft < 1) return '#ff4d4f';
    else if (daysLeft <= 3) return '#faad14';
    return '#1890ff';
  };





const handleReduce = () => {
  if (item.servings > 0) {
    const updatedItem = { ...item, servings: item.servings - 1 };
    if (onReduceServings) onReduceServings(updatedItem);
  }
};

  return (
  <View style={[styles.card, { borderColor: '#e0e0e0', borderWidth: 1 }]}>
      
      {/* Minus button in top right */}
          <TouchableOpacity
  onPress={handleReduce}
  style={[styles.minusBtn, { backgroundColor: '#ffd6d6' }]}
>
  <Text style={styles.minusBtnText}>−</Text>
</TouchableOpacity>


  <View style={styles.leftColumn}>

    {item.isSample && (
          <View style={{
            backgroundColor: '#ffe58f',
            paddingHorizontal: 6,
            borderRadius: 6,
            alignSelf: 'flex-start',
            marginBottom: 4
          }}>
            <Text style={{ color: '#ad6800', fontSize: 10, fontWeight: 'bold' }}>SAMPLE</Text>
          </View>
        )}

    <Text
      style={[
        styles.namePill,
        { backgroundColor: bg, color: text, marginBottom: 8, textAlign: 'center' }
      ]}
      numberOfLines={2}
      adjustsFontSizeToFit
      minimumFontScale={0.7}
    >
      {item.name}
    </Text>

     <Text style={{ color: text, fontSize: 12, marginBottom: 8, fontStyle: 'italic' }}>
  {getStatusText(daysLeft)}
    </Text>

    {item.image ? (
      <Image source={{ uri: item.image }} style={styles.image} />
    ) : (
      <View style={[styles.image, styles.placeholder]}>
      <Text style={styles.noImageText}>No Image</Text>
    </View>
    )}
  </View>

  <View style={styles.info}>
    <Text>Category: {item.category}</Text>
    <Text>Quantity: {item.quantity}</Text>
    <Text>Servings: {item.servings}</Text>
    <Text>Storage: {item.storage}</Text>
    <Text style={styles.date}>
      Best before: {moment(item.expires).format('D MMM YYYY (ddd)')}
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
  backgroundColor: '#e6f0ff', // refined light blue
},
editBtnText: {
  color: '#1765ad', // refined blue
  fontWeight: 'bold',
  fontSize: 12,
},
historyBtn: {
  backgroundColor: '#fff7e6', // refined light orang
},
historyBtnText: {
  color: '#d48806', // refined orange
  fontWeight: 'bold',
  fontSize: 12,
},
image: {
  width: 72,
  height: 72,
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
imageBox: {
  marginRight: 16,
},
info: {
  flex: 1,
  justifyContent: 'flex-start',
},
leftColumn: {
  width: 110, // increase from 90 to 110 (or more if you want)
  alignItems: 'center',
  marginRight: 24, // increase margin between columns
},
info: {
  flex: 1,
  justifyContent: 'flex-start',
  alignItems: 'flex-start', // ensures left alignment
},
namePill: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 999,
  fontWeight: 'bold',
  fontSize: 16,
  alignSelf: 'center',      // <-- center, not stretch
  marginBottom: 2,
  overflow: 'hidden',
  maxWidth: 100,             // <-- optional: keeps long names from overflowing
},
minusBtn: {
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: '#ffd6d6', // light red or any color you like
  borderRadius: 16,
  width: 28,
  height: 28,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
},
minusBtnText: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#333',
},
  // ...other styles...
});