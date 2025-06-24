import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useTaskContext } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import FAB from '../components/FAB';
import { isToday, isBefore } from '../utils/dateUtils';
import TaskDetailModal from '../components/TaskDetailModal';
import { Image } from 'react-native';

const TodayScreen = () => {
  const { state, moveTaskToCategory, toggleComplete, moveTo } = useTaskContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [lastCompletedTask, setLastCompletedTask] = useState(null);

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

  const handleOnPressItem= (item)  => {
      setSelectedTask(item);
      setDetailModalVisible(true);
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
      toggleComplete(lastCompletedTask.id); 
      setSnackbarVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      
      <Text style={styles.header}>Today</Text>
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
                    Take a deep breath. You've cleared your priorities.
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

      <FAB onPress={() => setModalVisible(true)} />
      <AddTaskModal visible={modalVisible} onClose={() => setModalVisible(false)} />

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
          onPress: () => {
            handleUndo();
          },
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


export default TodayScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16,  backgroundColor: '#f6f8fa'  },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, marginTop: 35, color: '#222' },
  empty: { color: '#777', fontSize: 16, textAlign: 'center', marginTop: 40 },
});


