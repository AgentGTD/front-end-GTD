import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';
import { useTaskContext } from '../context/TaskContext';
import { useNavigation } from '@react-navigation/native';
import FAB from '../components/FAB';
import { useChatBot } from '../context/ChatBotContext';
import Ionicons from '@expo/vector-icons/Ionicons';



const ProjectScreen = () => {
  const { state, addProject } = useTaskContext();
  const { openChatBot } = useChatBot();

  const [modalVisible, setModalVisible] = useState(false);
  const [projectName, setProjectName] = useState('');
  const navigation = useNavigation();

  // Count tasks for each project
  const getTaskCount = (projectId) =>
    state.tasks.filter(
      (task) => task.projectId === projectId && !task.completed && !task.trashed
    ).length;

  const handleAddProject = () => {
    if (projectName.trim()) {
      addProject(projectName.trim());
      setProjectName('');
      setModalVisible(false);
    }
  };

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
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Projects</Text>
        <TouchableOpacity style={styles.addProjectBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={state.projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
                                    <Image
                                      source={require('../assets/ps1.png')}
                                      style={{ width: 300, height: 300, marginBottom: 24, opacity: 0.85, }}
                                      resizeMode="contain"
                                    />
                                    <Text style={{ fontSize: 18, color: '#333', fontWeight: '600', textAlign: 'center', marginTop: 30 }}>
                                       Start small — or dream big
                                    </Text>
                                    <Text style={{ fontSize: 15, color: '#888', fontWeight: '400', marginTop: 6, textAlign: 'center', maxWidth: 260, lineHeight: 22 }}>
                                      Organize your goals into meaningful projects.
                                    </Text>
                  </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <FAB onPress={openChatBot} />

      {/* Add Project Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modal}>
                <Text style={styles.modalTitle}>New Project</Text>
                <TextInput
                  placeholder="# Project Name"
                  value={projectName}
                  onChangeText={setProjectName}
                  style={styles.input}
                  autoFocus
                />
                <TouchableOpacity
                  style={[
                    styles.addBtn,
                    { backgroundColor: projectName.trim() ? '#007AFF' : '#ccc' },
                  ]}
                  onPress={handleAddProject}
                  disabled={!projectName.trim()}
                >
                  <Text style={styles.addText}>Add Project</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>


    </View>
  );
};

export default ProjectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#f6f8fa',
    
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
     marginTop: 35,

  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    
  },
  addProjectBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
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
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    width: '85%',
    padding: 22,
    borderRadius: 14,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  addBtn: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  addText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: 2,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
});
