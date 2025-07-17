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
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
  onReduceServings,
  onReorderItems,
  onMoveSectionUp,
  onMoveSectionDown,
  onMoveShelfUp,
  onMoveShelfDown,
  onAddSection,
  onAddShelf,
  onRenameSection, // new prop for renaming section
  onRenameShelf, // new prop for renaming shelf
  onExitRename, // callback to notify parent when rename mode should exit
}) => {
  const [editMode, setEditMode] = useState(false);
  const [renamingSectionIdx, setRenamingSectionIdx] = useState(null);
  const [renamingSectionValue, setRenamingSectionValue] = useState('');
  const [renamingShelf, setRenamingShelf] = useState({ idx: null, shelfIdx: null });
  const [renamingShelfValue, setRenamingShelfValue] = useState('');

  // Section and shelf toggling logic
  const exitRenameMode = React.useCallback(() => {
    setRenamingSectionIdx(null);
    setRenamingShelf({ idx: null, shelfIdx: null });
  }, []);

  // Pass the exit function to parent when exitRenameMode or onExitRename changes
  useEffect(() => {
    if (onExitRename) {
      onExitRename(exitRenameMode);
    }
  }, [exitRenameMode, onExitRename]);

  const handleSectionToggle = (sectionTitle) => {
    exitRenameMode();
    if (onSectionFilter) onSectionFilter(sectionTitle);
  };

  const handleShelfToggle = (shelfName) => {
    exitRenameMode();
    if (openShelves.includes(shelfName)) {
      setOpenShelves(openShelves.filter((s) => s !== shelfName));
    } else {
      setOpenShelves([...openShelves, shelfName]);
    }
  };

  // Handler for adding a new section
  const handleAddSection = () => {
    exitRenameMode();
    if (typeof onAddSection === 'function') {
      onAddSection();
    }
  };

  // Handler for adding a new shelf to a section
  const handleAddShelf = (sectionIdx) => {
    exitRenameMode();
    if (typeof onAddShelf === 'function') {
      onAddShelf(sectionIdx);
    }
  };

  return (
    <View style={{ padding: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10 }}>
        <TouchableOpacity
          style={[styles.editBtn, editMode && styles.editBtnActive]}
          onPress={() => {
            exitRenameMode();
            setEditMode(!editMode);
          }}
        >
          <Text style={[styles.editBtnText, editMode && styles.editBtnTextActive]}>{editMode ? 'Done' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>
      {/* Add Section button in edit mode (moved to top) */}
      {editMode && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAddSection}
        >
          <Text style={styles.addBtnText}>+ Add Section</Text>
        </TouchableOpacity>
      )}
      {sections.map((section, sectionIdx) => (
        <View key={section.title} style={styles.section}>
          {/* Add Shelf button in edit mode (only for first section) */}
          {editMode && sectionIdx === 0 && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => handleAddShelf(sectionIdx)}
            >
              <Text style={styles.addBtnText}>+ Add Shelf</Text>
            </TouchableOpacity>
          )}
          <View style={styles.sectionHeaderTouchable}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                onPress={() => handleSectionToggle(section.title)}
                style={{ flex: 1 }}
                activeOpacity={0.7}
              >
                {editMode && renamingSectionIdx === sectionIdx ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      style={styles.renameInput}
                      value={renamingSectionValue}
                      onChangeText={setRenamingSectionValue}
                      autoFocus
                    />
                    <TouchableOpacity
                      onPress={() => {
                        if (onRenameSection) onRenameSection(sectionIdx, renamingSectionValue);
                        setRenamingSectionIdx(null);
                      }}
                      style={styles.pencilBtnBox}
                    >
                      <MaterialIcons name="check-circle" size={22} color="#1765ad" style={styles.tickIcon} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.sectionHeader}>{section.title}</Text>
                    {editMode && (
                      <TouchableOpacity
                        onPress={() => {
                          exitRenameMode();
                          setRenamingSectionIdx(sectionIdx);
                          setRenamingSectionValue(section.title);
                        }}
                        style={styles.pencilBtnBox}
                      >
                        <MaterialIcons name="edit" size={18} color="#1765ad" style={styles.pencilIcon} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </TouchableOpacity>
              {editMode && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={sectionIdx !== 0 ? () => {
                      exitRenameMode();
                      onMoveSectionUp && onMoveSectionUp(sectionIdx);
                    } : undefined}
                    disabled={sectionIdx === 0}
                  >
                    <Text style={styles.moveText}>Move Up</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={sectionIdx !== sections.length - 1 ? () => {
                      exitRenameMode();
                      onMoveSectionDown && onMoveSectionDown(sectionIdx);
                    } : undefined}
                    disabled={sectionIdx === sections.length - 1}
                  >
                    <Text style={styles.moveText}>Move Down</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          {section.shelves.map((shelf, shelfIdx) => (
            <View key={shelf.shelf} style={styles.group}>
              <View style={styles.shelfBanner}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <TouchableOpacity
                    onPress={() => handleShelfToggle(shelf.shelf)}
                    style={{ flex: 1 }}
                    activeOpacity={0.7}
                  >
                    {editMode && renamingShelf.idx === sectionIdx && renamingShelf.shelfIdx === shelfIdx ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                          style={styles.renameInput}
                          value={renamingShelfValue}
                          onChangeText={setRenamingShelfValue}
                          autoFocus
                        />
                        <TouchableOpacity
                          onPress={() => {
                            if (onRenameShelf) onRenameShelf(sectionIdx, shelfIdx, renamingShelfValue);
                            setRenamingShelf({ idx: null, shelfIdx: null });
                          }}
                          style={styles.pencilBtnBox}
                        >
                          <MaterialIcons name="check" size={18} color="#1765ad" style={styles.pencilIcon} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.shelfTitle}>
                          {openShelves.includes(shelf.shelf) ? '▼' : '►'} {shelf.shelf}
                        </Text>
                        {editMode && (
                          <TouchableOpacity
                            onPress={() => {
                              exitRenameMode();
                              setRenamingShelf({ idx: sectionIdx, shelfIdx });
                              setRenamingShelfValue(shelf.shelf);
                            }}
                            style={styles.pencilBtnBox}
                          >
                            <MaterialIcons name="edit" size={18} color="#1765ad" style={styles.pencilIcon} />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                  {editMode && (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={shelfIdx !== 0 ? () => {
                          exitRenameMode();
                          onMoveShelfUp && onMoveShelfUp(sectionIdx, shelfIdx);
                        } : undefined}
                        disabled={shelfIdx === 0}
                      >
                        <Text style={styles.moveText}>Move Up</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={shelfIdx !== section.shelves.length - 1 ? () => {
                          exitRenameMode();
                          onMoveShelfDown && onMoveShelfDown(sectionIdx, shelfIdx);
                        } : undefined}
                        disabled={shelfIdx === section.shelves.length - 1}
                      >
                        <Text style={styles.moveText}>Move Down</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
              {openShelves.includes(shelf.shelf) && (
                <View style={styles.drawer}>
                  {shelf.items.length > 0 ? (
                    <FlatList
                      data={shelf.items}
                      keyExtractor={item => item.id}
                      renderItem={({ item }) => (
                        <ItemCard
                          item={item}
                          onEdit={onEdit}
                          onSendToHistory={onSendToHistory}
                          onReduceServings={onReduceServings}
                        />
                      )}
                    />
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
  moveBtn: {
    marginLeft: 4,
    backgroundColor: '#e3f1ff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#1765ad',
    opacity: 1,
  },
  moveBtnText: {
    color: '#1765ad',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeaderTouchable: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#e3f1ff',
    marginBottom: 6,
    width: '100%',
    shadowColor: '#1765ad',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  editBtn: {
    backgroundColor: '#e3f1ff',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  editBtnActive: {
    backgroundColor: '#1765ad',
  },
  editBtnText: {
    color: '#1765ad',
    fontWeight: 'bold',
  },
  editBtnTextActive: {
    color: '#fff',
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
  shelfBanner: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff', // Changed to white
    marginBottom: 6,
    marginTop: 2,
    alignItems: 'flex-start',
  },
  moveText: {
    color: '#1765ad',
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: 'normal',
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
    paddingVertical: 1,
    marginLeft: 1,
  },
  addBtn: {
    backgroundColor: '#e3f1ff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 10,
  },
  addBtnText: {
    color: '#1765ad',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pencilBtnBox: {
    marginLeft: 4,
    padding: 2,
    backgroundColor: '#e3f1ff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#b3d8fd',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 22,
    minHeight: 22,
    shadowColor: '#1765ad',
    shadowOpacity: 0.07,
    shadowRadius: 1,
    elevation: 1,
  },
  pencilIcon: {
    fontSize: 15,
    color: '#1765ad',
  },
  renameInput: {
    borderWidth: 1,
    borderColor: '#1765ad',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 14,
    minWidth: 60,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  // Removed renameConfirmBtn and renameConfirmText styles
});

export default ShelfSelector;