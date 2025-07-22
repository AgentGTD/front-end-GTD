import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput,  Modal, Image } from 'react-native';
import { useTaskContext } from '../context/TaskContext';
import FAB from '../components/FAB';
import {useChatBot} from '../context/ChatBotContext';
import { Ionicons } from '@expo/vector-icons';
import TaskCard from '../components/TaskCard'; 
import TaskDetailModal from '../components/TaskDetailModal';
import { Snackbar } from 'react-native-paper';


const NextActionScreen = ({ navigation }) => {
  const { state, deleteContext, toggleComplete, moveTo } = useTaskContext();
  const { openChatBot } = useChatBot();

  const [search, setSearch] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [contextToDelete, setContextToDelete] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
 const [lastCompletedTask, setLastCompletedTask] = useState(null);


  // Get all next actions grouped by context
  const nextActionsByContext = state.contexts.map(ctx => ({
    ...ctx,
    tasks: state.tasks.filter(
      task =>
        !task.completed &&
        !task.trashed &&
        task.nextActionId === ctx.id
    ),
  })).filter(ctx => ctx.tasks.length > 0);


  const projectResults = search
    ? state.projects
        .map((proj, idx) => ({
          type: 'project',
          id: proj.id,
          name: proj.name,
          idx,
          tasks: state.tasks.filter(
            (task) =>
              !task.completed &&
              !task.trashed &&
              task.projectId === proj.id
          ),
        }))
        .filter(
          (proj) =>
            typeof proj.name === 'string' &&
            proj.name.toLowerCase().includes(search.toLowerCase())
        )
    : [];

  const filteredContexts = search
  ? nextActionsByContext.filter(ctx => {
      const ctxName = ctx.context_name?.toLowerCase() || '';
      const searchTerm = search.toLowerCase().replace(/^@/, '');
      return (
        ctxName.includes(searchTerm) || 
        ('@' + ctxName).includes(search.toLowerCase())
      );
    })
  : nextActionsByContext;

 

   const handleComplete = (task) => {
    toggleComplete(task.id);
    setLastCompletedTask(task);
    setSnackbarVisible(true);
  };

  const handleMoveTo = (id, category, payload) => {
    moveTo(id, category, payload);
    setDetailModalVisible(false);
    setSelectedTask(null);
  };

  const handleUndo = () => {
    if (lastCompletedTask) {
      toggleComplete(lastCompletedTask.id);
      setSnackbarVisible(false);
    }
  };

    const handleOnPressItem= (item)  => {
      setSelectedTask(item);
      setDetailModalVisible(true);
  };  

  const renderContext = ({ item }) => (
  <>
    {item.tasks.map(task => (
      <TaskCard
        key={task.id}
        task={task}
        onPress={() => handleOnPressItem(task)}
        onComplete={() => handleComplete(task)}
        contexts={state.contexts}
      />
    ))}
  </>
);

 const getTaskCount = (projectId) =>
    state.tasks.filter(
      (task) => task.projectId === projectId && !task.completed && !task.trashed
    ).length;

const renderProject = ({ item }) => {
   const taskCount = getTaskCount(item.id);
    const isActive = taskCount > 0;
    const folderColor = isActive ? '#1976d2' : '#757575';
    const hashColor =  '#757575';
    const nameColor = '#222';
    const badgeBg = isActive ? '#e3f2fd' : '#f1f3f4';
    const badgeIcon = isActive ? '#43a047' : '#757575';
    const badgeText = isActive ? '#1976d2' : '#757575';
 
    return (
         <TouchableOpacity
           style={styles.projectCard}
           onPress={() =>
             navigation.navigate('ProjectDetail', {
               projectId: item.id,
               projectName: item.name,
             })
           }
           activeOpacity={0.85}
         >
           <View style={styles.projectLeft}>
             <Ionicons name="folder-outline" size={22} color={folderColor} style={{ marginRight: 10 }} />
             <Text style={[styles.projectHash, { color: hashColor }]}>#</Text>
             <Text style={[styles.projectName, { color: nameColor }]}>{item.name}</Text>
           </View>
           <View style={[styles.projectRight, { backgroundColor: badgeBg }]}>
             <Ionicons name="checkmark-done-circle-outline" size={18} color={badgeIcon} />
             <Text style={[styles.taskCountText, { color: badgeText }]}>{taskCount}</Text>
           </View>
         </TouchableOpacity>
       );
     };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons name="at-circle" size={34} color="#1976d2" style={{ marginRight: 8, marginTop: 2 }} />
        <Text style={styles.header}>Next Actions</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contexts @computer, @home"
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Context List */}
  <FlatList
  data={projectResults.length > 0 ? projectResults : filteredContexts}
  keyExtractor={(item) => item.id}
  renderItem={projectResults.length > 0 ? renderProject : renderContext}
  ListEmptyComponent={
   <View style={{ alignItems: 'center', marginTop: 60 }}>
                                                 <Image
                                                   source={require('../assets/na2.png')}
                                                   style={{ width: 350, height: 350, marginBottom: 0, marginTop: -50, opacity: 0.85, }}
                                                   resizeMode="contain"
                                                 />
                                                 <Text style={{ fontSize: 18, color: '#333', fontWeight: '600', textAlign: 'center' }}>
                                                  No clear next move ?
                                                 </Text>
                                                 <Text style={{ fontSize: 15, color: '#888', fontWeight: '400', marginTop: 6, textAlign: 'center', maxWidth: 260, lineHeight: 22 }}>
                                                  Decide what’s actionable — and do it with focus.
                                                 </Text>
                               </View>
  }
  contentContainerStyle={{ paddingBottom: 80 }}
/>

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

      {/* Delete Context Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: '#00000066',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: '#fff',
            width: '85%',
            padding: 24,
            borderRadius: 16,
            elevation: 8,
            alignItems: 'center',
          }}>
            <Ionicons name="trash-outline" size={38} color="#e53935" style={{ marginBottom: 10 }} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#e53935', marginBottom: 8, textAlign: 'center' }}>
              Delete Context?
            </Text>
            <Text style={{ color: '#444', fontSize: 15, marginBottom: 18, textAlign: 'center' }}>
              Are you sure you want to delete{' '}
              <Text style={{ fontWeight: 'bold', color: '#e53935' }}>
                @{contextToDelete?.context_name}
              </Text>
              ? All its tasks will be marked as completed.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#f1f3f4',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 22,
                  marginRight: 10,
                }}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={{ color: '#e53935', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#e53935',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 22,
                  marginLeft: 10,
                }}
                onPress={() => {
                  deleteContext(contextToDelete.id);
                  setDeleteModalVisible(false);
                  setContextToDelete(null);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default NextActionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f6f8fa',
  
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
     marginTop: 35,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginBottom: 18,
    elevation: 5,
    marginTop: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
   projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: 'space-between',
  },
  projectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  projectHash: {
    color: '#757575', 
    fontSize: 17,
    fontWeight: 'bold',
    marginRight: 4,
  },
  projectName: {
    fontSize: 17,
    fontWeight: 'normal', 
    color: '#222',        
    flexShrink: 1,
  },
  projectRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#f1f3f4',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  taskCountText: {
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#757575',
    fontSize: 15,
  },
  actionCountText: {
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#1976d2',
    fontSize: 15,
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 10,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 8,
    marginLeft: 24,
    marginRight: 8,
    padding: 12,
    elevation: 1,
  },
  taskTitle: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  taskDesc: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
});