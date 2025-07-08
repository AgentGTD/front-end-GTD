import React, { useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, TextInput, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTaskContext } from '../context/TaskContext';
import TaskDetailModal from '../components/TaskDetailModal';
import FAB from '../components/FAB';
import AddTaskModal from '../components/AddTaskModal';
import TaskCard from '../components/TaskCard';
import { Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const ProjectDetailScreen = () => {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { projectId, projectName } = params;
  const { state, toggleComplete, getTasksByProject, deleteProject, updateProject, moveTo } = useTaskContext();
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [lastCompletedTask, setLastCompletedTask] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Menu and delete modal state
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const project = state.projects.find(p => p.id === projectId);
  const currentProjectName = project?.name || 'Project Details';

  // Edit project modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(currentProjectName);

  useLayoutEffect(() => {
  navigation.setOptions({
    title: currentProjectName,
    headerTitleStyle: {
      fontSize: 20,
      fontWeight: 'semi-bold',
      marginLeft: 10,
    },
    headerRight: () => (
      <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ padding: 8 }}>
        <Ionicons name="ellipsis-vertical" size={24} color="#444" />
      </TouchableOpacity>
    ),
  });
}, [navigation, currentProjectName]);

  const tasks = getTasksByProject(projectId);

  const renderTask = ({ item }) => (
    <TaskCard
      task={item}
      onPress={() => handleOnPressItem(item)}
      onComplete={() => handleComplete(item)}
    />
  );

  const handleComplete = (task) => {
    toggleComplete(task.id);
    setLastCompletedTask(task);
    setSnackbarVisible(true);
  };

  const handleOnPressItem = (item) => {
    setSelectedTask(item);
    setDetailModalVisible(true);
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


  const handleDeleteProject = () => {
    deleteProject(projectId);
    setDeleteModalVisible(false);
    navigation.goBack();
  };

  const handleSaveEdit = () => {
    const updatedProject = {
      id: projectId,
      name: editName,
    };
    updateProject(updatedProject);
    setEditModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
                                              <Image
                                                source={require('../assets/pds1.png')}
                                                style={{ width: 350, height: 350, marginBottom: 24, opacity: 0.85, marginTop: -20 }}
                                                resizeMode="contain"
                                              />
                                              <Text style={{ fontSize: 18, color: '#333', fontWeight: '600', textAlign: 'center' }}>
                                                 Nothing in motion yet.
                                              </Text>
                                              <Text style={{ fontSize: 15, color: '#888', fontWeight: '400', marginTop: 6, textAlign: 'center', maxWidth: 260, lineHeight: 22 }}>
                                               Add your first step toward progress.
                                              </Text>
                            </View>
        }
      />

      <FAB onPress={() => setTaskModalVisible(true)} />

      <AddTaskModal
        visible={taskModalVisible}
        onClose={() => setTaskModalVisible(false)}
        defaultProjectId={projectId}
        defaultCategory="projects"
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

      {/* --- 3-dots Menu --- */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setEditModalVisible(true);
              }}
            >
              <Ionicons name="pencil-outline" size={20} color="#444" style={{ marginRight: 10 }} />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setDeleteModalVisible(true);
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#e53935" style={{ marginRight: 10 }} />
              <Text style={[styles.menuText, { color: '#e53935' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- Delete Confirmation Modal --- */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setDeleteModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.deleteModal}>
              <Text style={styles.deleteTitle}>Delete project?</Text>
              <Text style={styles.deleteDesc}>
                This will permanently delete <Text style={{ fontWeight: 'bold', color: '#e53935' }}>&ldquo;{projectName}&rdquo;</Text> and all its tasks. This can’t be undone.
              </Text>
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.cancelText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmDeleteBtn}
                  onPress={handleDeleteProject}
                >
                  <Text style={styles.confirmDeleteText}>DELETE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* --- Edit Project Modal --- */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setEditModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <View style={styles.editModal}>
              <Text style={styles.editTitle}>Edit Project</Text>
              {/* Name */}
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                maxLength={120}
                placeholder="# Project Name"
              />
              <Text style={styles.editCount}>{editName.length}/120</Text>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => {
                  handleDeleteProject();
                  setEditModalVisible(false);
                  setDeleteModalVisible(true);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#e53935" />
                <Text style={styles.deleteText}>DELETE</Text>
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  handleSaveEdit();
                  setEditModalVisible(false);
                }}
              >
                <Ionicons name="checkmark" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ProjectDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 2,
  },
  empty: {
    marginTop: 20,
    textAlign: 'center',
    color: '#999',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 48,
    paddingRight: 18,
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
    width: 160,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  menuText: {
    fontSize: 16,
    color: '#222',
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: {
    backgroundColor: '#fff',
    width: '85%',
    padding: 24,
    borderRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteDesc: {
    color: '#444',
    fontSize: 15,
    marginBottom: 18,
    textAlign: 'center',
  },
  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelBtn: {
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginRight: 10,
  },
  cancelText: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmDeleteBtn: {
    backgroundColor: '#e53935',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginLeft: 10,
  },
  confirmDeleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editModal: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 22,
    borderRadius: 16,
    elevation: 8,
    alignItems: 'stretch',
    position: 'relative',
  },
  editTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 2,
  },
  editCount: {
    alignSelf: 'flex-end',
    color: '#bbb',
    fontSize: 12,
    marginBottom: 10,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  editLabel: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  editValue: {
    fontSize: 15,
    color: '#888',
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 10,
    marginLeft: 30,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  colorCircleSelected: {
    borderColor: '#e53935',
    borderWidth: 2,
  },
  layoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  layoutOption: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
    marginHorizontal: 4,
  },
  layoutOptionSelected: {
    backgroundColor: '#fde0dc',
  },
  layoutLabel: {
    fontSize: 14,
    color: '#888',
  },
  archiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
    padding: 8,
  },
  archiveText: {
    color: '#444',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    padding: 8,
  },
  deleteText: {
    color: '#e53935',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
  },
  saveBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: '#007AFF',
    borderRadius: 18,
    padding: 8,
    elevation: 2,
  },
});
