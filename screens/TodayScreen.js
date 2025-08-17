import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSnackbar } from '../context/SnackBarContext'; 
import { useTaskContext } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import FAB from '../components/FAB';
import { useChatBot } from '../context/ChatBotContext';
import { isToday, isBefore } from '../utils/dateUtils';
import TaskDetailModal from '../components/TaskDetailModal';
import MenuComponent from '../components/MenuComponent';
import SkeletonTask from '../components/Loaders/SkeletonTask';

const TodayScreen = () => {
  const { state, stateRef, toggleComplete, moveTo } = useTaskContext();
  const { openChatBot } = useChatBot();
  const { showSnackbar } = useSnackbar();

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const today = new Date();
  const todayTasks = state.tasks
    .filter(task =>
      (isToday(task.dueDate) || isBefore(task.dueDate, today)) && !task.completed && !task.trashed
    )
    .sort((a, b) => a.priority - b.priority || new Date(a.dueDate) - new Date(b.dueDate));
  
  const overdueTasks = state.tasks
    .filter(task => isBefore(task.dueDate, today) && !task.completed && !task.trashed)
    .sort((a, b) => a.priority - b.priority || new Date(a.dueDate) - new Date(b.dueDate));

  const handleMoveTo = (id, category, payload) => {
    moveTo(id, category, payload);
    setDetailModalVisible(false);
    setSelectedTask(null);
  };

  const handleOnPressItem = (item) => {
    setSelectedTask(item);
    setDetailModalVisible(true);
  };  

 
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

  if (state.loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Today</Text>
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
        <Text style={styles.header}>Today</Text>
        <MenuComponent visible={menuVisible} onClose={() => setMenuVisible(false)} style={styles.menu} />
      </View>
     
      { (todayTasks.length === 0 && overdueTasks.length === 0) ? (
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <Image
            source={require('../assets/today2.png')}
            style={{ width: 300, height: 300, marginBottom: 24, opacity: 0.85, marginTop: 45 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 18, color: '#333', fontWeight: '600', textAlign: 'center' }}>
            Enjoy your {new Date().toLocaleDateString(undefined, { weekday: 'long' })}!
          </Text>
          <Text style={{ fontSize: 15, color: '#888', fontWeight: '400', marginTop: 6, textAlign: 'center', maxWidth: 260, lineHeight: 22 }}>
            Take a deep breath. You&apos;ve cleared your priorities.
          </Text>
        </View>
      ) : (
        <FlatList
          data={todayTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => handleOnPressItem(item)}
              onComplete={() => handleComplete(item)}
            />
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
  menu:{
     paddingRight: 10
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
});

export default TodayScreen;