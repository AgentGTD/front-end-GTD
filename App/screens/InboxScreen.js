import React, { useState, } from 'react';
import { View, Text, SectionList, StyleSheet, Image, } from 'react-native';
import { isAfter } from 'date-fns';
import { useTaskContext } from '../context/TaskContext';
import { groupTasksByDate } from '../utils/groupTasks';
import FAB from '../components/FAB';
import AddTaskModal from '../components/AddTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import TaskCard from '../components/TaskCard';
import { Snackbar } from 'react-native-paper';

const InboxScreen = () => {
  const { state,  toggleComplete, moveTo } = useTaskContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [lastCompletedTask, setLastCompletedTask] = useState(null);

 const handleMoveTo = (id, category, payload) => {
    moveTo(id, category, payload);
    setDetailModalVisible(false);
    setSelectedTask(null);
  };
  // Handler for completing a task
  const handleComplete = (task) => {
    toggleComplete(task.id);
    setLastCompletedTask(task);
    setSnackbarVisible(true);
  };

  // Handler for undo
  const handleUndo = () => {
    if (lastCompletedTask) {
      toggleComplete(lastCompletedTask.id); // Un-complete
      setSnackbarVisible(false);
    }
  };

  const filtered = state.tasks.filter(
    task =>
      !task.completed &&
      !task.trashed &&
      (task.category === 'inbox' || !task.category) &&
      !task.projectId &&
      !task.nextActionId &&
      isAfter(new Date(task.dueDate), new Date(2025, 0, 1))
  );

  const grouped = groupTasksByDate(
    filtered.sort((a, b) =>
      a.priority - b.priority || new Date(a.dueDate) - new Date(b.dueDate)
    )
  );

  const handleOnPressItem = (item) => {
    setSelectedTask(item);
    setDetailModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Inbox</Text>

      {grouped.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 60 }}>
                          <Image
                            source={require('../assets/ib2.png')}
                            style={{ width: 300, height: 300, marginBottom: 24, opacity: 0.85, marginTop: 45 }}
                            resizeMode="contain"
                          />
                          <Text style={{ fontSize: 18, color: '#333', fontWeight: '600', textAlign: 'center' }}>
                             Brain’s clear — for now.
                          </Text>
                          <Text style={{ fontSize: 15, color: '#888', fontWeight: '400', marginTop: 6, textAlign: 'center', maxWidth: 260, lineHeight: 22 }}>
                            Capture your thoughts before they slip away.
                          </Text>
        </View>
      ) : (

      <SectionList
        sections={grouped}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => handleOnPressItem(item)}
            onComplete={() => handleComplete(item)}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
      />
      )}

      <FAB onPress={() => setModalVisible(true)} />

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      {selectedTask && detailModalVisible && (
        <TaskDetailModal
          visible={detailModalVisible}
          task={selectedTask}
          onClose={() => {
            setDetailModalVisible(false);
            setSelectedTask(null);
          }}
          moveTo={handleMoveTo}
          onComplete={handleComplete} 
        />
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Undo',
          onPress: handleUndo,
          labelStyle: { color: '#007AFF', fontWeight: 'bold' },
        }}
        style={{ backgroundColor: '#222', marginBottom: 45, marginLeft: 15, borderRadius: 8 }}
      >
        <Text style={{ fontWeight: 'bold', color: '#fff' }}>
          {lastCompletedTask?.title}{'  '}
          <Text style={{ fontWeight: 'normal', color: '#fff'}}>
            Completed !!
          </Text>
        </Text>
      </Snackbar>
    </View>
  );
};

export default InboxScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
     backgroundColor: '#f6f8fa',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    paddingVertical: 12,
    marginTop: 35,
    color: '#222',
  },
  taskItem: {
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#f1f1f1',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
});
