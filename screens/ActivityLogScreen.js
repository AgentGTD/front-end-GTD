import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTaskContext } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import { Ionicons } from '@expo/vector-icons';
import TaskDetailModal from '../components/TaskDetailModal';
import FilterModal from '../components/FilterModal';

const ActivityLogScreen = ({ navigation }) => {
  const { state, toggleComplete } = useTaskContext();
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    selectedDate: null,
    selectedProjects: [],
    selectedContexts: []
  });

  // Get unique lists for filter options
  const projectList = useMemo(() => {
    return Array.from(
      new Set(
        state.tasks
          .filter(task => task.projectId)
          .map(task => {
            const project = state.projects.find(p => p.id === task.projectId);
            return project ? project.name : 'Unknown';
          })
      )
    ).sort();
  }, [state.tasks, state.projects]);

  const contextList = useMemo(() => {
    return Array.from(
      new Set(
        state.tasks
          .filter(task => task.nextActionId)
          .map(task => {
            const context = state.contexts.find(c => c.id === task.nextActionId);
            return context ? context.context_name : 'Unknown';
          })
      )
    ).sort();
  }, [state.tasks, state.contexts]);

  const completedTasks = useMemo(() => 
    state.tasks.filter(task => task.completed),
    [state.tasks]
  );

  const filteredTasks = useMemo(() => {
    return completedTasks.filter(task => {
      // Filter by date
      if (filters.selectedDate) {
        const taskDate = task.completedAt ? new Date(task.completedAt) : null;
        if (!taskDate || taskDate.toDateString() !== filters.selectedDate.toDateString()) {
          return false;
        }
      }
      
      // Filter by projects
      if (filters.selectedProjects.length > 0) {
        if (!task.projectId) return false;
        const project = state.projects.find(p => p.id === task.projectId);
        if (!project || !filters.selectedProjects.includes(project.name)) {
          return false;
        }
      }
      
      // Filter by contexts
      if (filters.selectedContexts.length > 0) {
        if (!task.nextActionId) return false;
        const context = state.contexts.find(c => c.id === task.nextActionId);
        if (!context || !filters.selectedContexts.includes(context.context_name)) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => 
      new Date(b.completedAt) - new Date(a.completedAt)
    );
  }, [completedTasks, filters, state.projects, state.contexts]);

  const handleUncomplete = (task) => {
    toggleComplete(task.id);
    setDetailModalVisible(false);
  };

  const handleOnPressItem = (item) => {
    setSelectedTask(item);
    setDetailModalVisible(true);
  };

  const handleApplyFilter = (newFilters) => {
    setFilters(newFilters);
    setFilterModalVisible(false);
  };

  const getFilterIndicator = () => {
    const activeFilters = [];
    
    if (filters.selectedDate) activeFilters.push('Date');
    if (filters.selectedProjects.length > 0) activeFilters.push('Projects');
    if (filters.selectedContexts.length > 0) activeFilters.push('Contexts');
    
    return activeFilters.length > 0 ? ` (${activeFilters.length})` : '';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.header}>Activity Log{getFilterIndicator()}</Text>
          <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
            <Ionicons name="filter" size={24} color="#444" />
          </TouchableOpacity>
        </View>
        
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={60} color="#ccc" />
            <Text style={styles.emptyTitle}>No completed tasks</Text>
            <Text style={styles.emptyText}>
              {filters.selectedDate || 
               filters.selectedProjects.length > 0 || 
               filters.selectedContexts.length > 0
                ? "Try changing your filters"
                : "Complete some tasks to see them here"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={() => handleOnPressItem(item)}
                onComplete={() => {}} // No action on complete circle
                showProject={true}
                showContext={true}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
        
        {selectedTask && (
          <TaskDetailModal
            visible={detailModalVisible}
            task={selectedTask}
            onClose={() => setDetailModalVisible(false)}
            onComplete={() => handleUncomplete(selectedTask)}
            moveTo={() => {}}
          />
        )}
        
        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApplyFilter={handleApplyFilter}
          projectList={projectList}
          contextList={contextList}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 5,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    maxWidth: 300,
  },
});

export default ActivityLogScreen;