import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  FlatList,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const FilterModal = ({
  visible,
  onClose,
  onApplyFilter,
  projectList = [],
  contextList = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    projects: [],
    contexts: [],
    date: null
  });
  const [filteredItems, setFilteredItems] = useState([]);

  // Combine projects and contexts for search
  const allItems = [
    ...projectList.map(name => ({ id: `project-${name}`, name, type: 'project' })),
    ...contextList.map(name => ({ id: `context-${name}`, name, type: 'context' }))
  ];

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const results = allItems.filter(item => 
        item.name.toLowerCase().includes(query)
      );
      setFilteredItems(results);
    } else {
      setFilteredItems([]);
    }
  }, [searchQuery]);

  const toggleFilter = (item) => {
    setSelectedFilters(prev => {
      if (item.type === 'project') {
        const newProjects = prev.projects.includes(item.name)
          ? prev.projects.filter(name => name !== item.name)
          : [...prev.projects, item.name];
        
        return { ...prev, projects: newProjects };
      } else {
        const newContexts = prev.contexts.includes(item.name)
          ? prev.contexts.filter(name => name !== item.name)
          : [...prev.contexts, item.name];
        
        return { ...prev, contexts: newContexts };
      }
    });
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setSelectedFilters(prev => ({ ...prev, date }));
    }
  };

  const handleApply = () => {
    onApplyFilter({
      selectedDate: selectedFilters.date,
      selectedProjects: selectedFilters.projects,
      selectedContexts: selectedFilters.contexts
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedFilters({ projects: [], contexts: [], date: null });
    setSelectedDate(null);
    setSearchQuery('');
    onApplyFilter({
      selectedDate: null,
      selectedProjects: [],
      selectedContexts: []
    });
    onClose();
  };

  const isSelected = (item) => {
    if (item.type === 'project') {
      return selectedFilters.projects.includes(item.name);
    }
    return selectedFilters.contexts.includes(item.name);
  };

  const renderFilterItem = ({ item }) => (
    <TouchableOpacity
      style={styles.filterItem}
      onPress={() => toggleFilter(item)}
    >
      <Ionicons
        name={isSelected(item) ? 'checkbox' : 'square-outline'}
        size={24}
        color={isSelected(item) ? '#007AFF' : '#888'}
      />
      <Text style={styles.filterItemText}>
        {item.type === 'project' ? '#' : '@'} {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Filter Activity</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#888" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search #projects or @contexts"
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                />
              </View>

              {/* Date Selector */}
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#007AFF" />
                <Text style={styles.dateText}>
                  {selectedDate ? 
                    selectedDate.toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric'
                    }) : 
                    'Search by specific date'
                  }
                </Text>
              </TouchableOpacity>

              {/* Results List */}
              {searchQuery && (
                <View style={styles.resultsContainer}>
                  <Text style={styles.sectionTitle}>
                    {filteredItems.length > 0 ? 'Search Results' : 'No matches found'}
                  </Text>
                  <FlatList
                    data={filteredItems}
                    keyExtractor={item => item.id}
                    renderItem={renderFilterItem}
                    style={styles.resultsList}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              )}

              {/* Selected Filters */}
              <View style={styles.selectedContainer}>
                {(selectedFilters.projects.length > 0 || 
                  selectedFilters.contexts.length > 0 || 
                  selectedFilters.date) && (
                  <Text style={styles.sectionTitle}>Selected Filters</Text>
                )}
                
                {selectedFilters.date && (
                  <View style={styles.selectedFilter}>
                    <Ionicons name="calendar" size={16} color="#007AFF" />
                    <Text style={styles.selectedFilterText}>
                      {selectedFilters.date.toLocaleDateString('en-US', { 
                        day: 'numeric', 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                )}
                
                {selectedFilters.projects.map(project => (
                  <View key={project} style={styles.selectedFilter}>
                    <Ionicons name="pricetag" size={16} color="#007AFF" />
                    <Text style={styles.selectedFilterText}>#{project}</Text>
                  </View>
                ))}
                
                {selectedFilters.contexts.map(context => (
                  <View key={context} style={styles.selectedFilter}>
                    <Ionicons name="at" size={16} color="#007AFF" />
                    <Text style={styles.selectedFilterText}>{context}</Text>
                  </View>
                ))}
              </View>

              {/* Footer Buttons */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.resetButton]}
                  onPress={handleReset}
                >
                  <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.applyButton]}
                  onPress={handleApply}
                >
                  <Text style={[styles.buttonText, styles.applyButtonText]}>
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
              
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333'
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 15
  },
  dateText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
    marginRight: 15
  },
  resultsContainer: {
    maxHeight: 200,
    marginBottom: 15
  },
  resultsList: {
    flexGrow: 0
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  filterItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333'
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15
  },
  selectedFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4
  },
  selectedFilterText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#1976D2'
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  resetButton: {
    backgroundColor: '#F5F5F7',
    marginRight: 10
  },
  applyButton: {
    backgroundColor: '#007AFF'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  applyButtonText: {
    color: 'white'
  }
});

export default FilterModal;