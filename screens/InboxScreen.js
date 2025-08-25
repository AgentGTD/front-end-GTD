import React, { useState, } from 'react';
import { View, Text, SectionList, StyleSheet, Image, } from 'react-native';
import { isAfter } from 'date-fns';
import { useTaskContext } from '../context/TaskContext';
import { groupTasksByDate } from '../utils/groupTasks';
import FAB from '../components/FAB';
import { useChatBot } from '../context/ChatBotContext';
import TaskDetailModal from '../components/TaskDetailModal';
import TaskCard from '../components/TaskCard';
import MenuComponent from '../components/MenuComponent';
import { useSnackbar } from '../context/SnackBarContext'; 
import SkeletonTask from '../components/Loaders/SkeletonTask';

const InboxScreen = () => {
  const { state, stateRef, toggleComplete, moveTo } = useTaskContext();
  const { openChatBot } = useChatBot();
  const { showSnackbar } = useSnackbar();
  
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);


  // Snackbar state
  //const [snackbarVisible, setSnackbarVisible] = useState(false);

 const handleMoveTo = (id, category, payload) => {
    moveTo(id, category, payload);
    setDetailModalVisible(false);
    setSelectedTask(null);
  };
  
  
  // Handler for completing a task
  const handleComplete = (task) => {
  toggleComplete(task.id);

  showSnackbar(
    `${task.title} completed!`,
    () => {
      const currentTask = stateRef.current.tasks.find(t => t.id === task.id);
      if (currentTask?.completed) {
        toggleComplete(task.id);
      }
    },
    'Undo'
  );
}


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

  if (state.loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Inbox</Text>
        </View>
        <SkeletonTask />
        <SkeletonTask />
        <SkeletonTask />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Inbox</Text>
        <MenuComponent visible={menuVisible} onClose={() => setMenuVisible(false)} style={styles.menu} />
      </View>

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

      <FAB onPress={openChatBot} />

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
  headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      marginBottom: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  menu:{
     paddingRight: 10
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
