import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, FlatList, ScrollView, TouchableWithoutFeedback  } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTaskContext } from '../context/TaskContext';
import { StatusBar } from 'expo-status-bar';

const PRIORITY_COLORS = ['#e53935', '#fb8c00', '#1976d2', '#43a047', '#757575'];

const TaskDetailModal = ({ visible, task, onClose, moveTo, onComplete }) => {
  const { state, updateTask, addProject, addContext, toggleComplete } = useTaskContext();
  const [editableTask, setEditableTask] = useState(task);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Which sub-modal is open: 'priority', 'project', 'context', 'edit'
  const [modalType, setModalType] = useState(null);

  // For project/context selection
  const [selectedProject, setSelectedProject] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedContext, setSelectedContext] = useState('');
  const [newContextName, setNewContextName] = useState('');

  useEffect(() => {
    if (visible) setEditableTask(task);
  }, [task, visible]);

  // --- Handlers ---
  const handleSave = () => {
    updateTask(editableTask);
    onClose();
  };

  const handleMoveToProject = async () => {
    if (newProjectName.trim()) {
      const projectName = newProjectName.trim();
      // Await the project creation and get the new project object
      const newProject = await addProject(projectName);
      if (newProject && newProject.id) {
        await moveTo(editableTask.id, 'project', { projectId: newProject.id });
        setEditableTask({ ...editableTask, projectId: newProject.id });
        setSelectedProject(newProject.id);
      }
      setNewProjectName('');
    } else if (selectedProject) {
      await moveTo(editableTask.id, 'project', { projectId: selectedProject });
      setEditableTask({ ...editableTask, projectId: selectedProject });
    }
    setModalType(null);
  };
  const handleMoveToNext = async () => {
    const contextToAssign = newContextName.trim() || selectedContext;
    if (contextToAssign) {
      if (newContextName.trim()) {
        // Await the context creation and get the new context object
        const newContext = await addContext(newContextName.trim());
        if (newContext && newContext.id) {
          await moveTo(editableTask.id, 'next', { contextId: newContext.id });
          setEditableTask({ ...editableTask, nextActionId: newContext.id });
          setSelectedContext(newContext.id);
        }
      } else if (selectedContext) {
        await moveTo(editableTask.id, 'next', { contextId: selectedContext });
        setEditableTask({ ...editableTask, nextActionId: selectedContext });
      }
      setNewContextName('');
    }
    setModalType(null);
  };

  // Handler for completing the task
  const handleComplete = () => {
    if (onComplete) {
      onComplete(editableTask); // Notify parent (e.g., for snackbar in parent)
    } else {
      toggleComplete(editableTask.id);
    }
    onClose();
  };

  
  // data
  const projectList = Array.isArray(state.projects) ? state.projects : [];
  const contextList = state.contexts.filter(c => c.context_name && c.context_name.trim() !== '');

  // sub-modals
  const renderPriorityModal = () => (
    <Modal visible={modalType === 'priority'} animationType="slide" transparent onRequestClose={() => setModalType(null)}>
      <TouchableWithoutFeedback onPress={() => setModalType(null)}>
        <View style={styles.bottomSheetOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
              <Text style={styles.sheetTitle}>Priority</Text>
              <View style={styles.priorityRow}>
                {[1, 2, 3, 4, 5].map((p, idx) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityFlag,
                      editableTask.priority === p && styles.selectedFlag,
                      { borderColor: PRIORITY_COLORS[idx] },
                    ]}
                    onPress={() => {
                      setEditableTask({ ...editableTask, priority: p });
                      setModalType(null);
                    }}
                  >
                    <MaterialIcons name="flag" size={28} color={PRIORITY_COLORS[idx]} />
                    <Text style={styles.flagLabel}>P{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderProjectModal = () => (
    <Modal visible={modalType === 'project'} animationType="slide" transparent onRequestClose={() => setModalType(null)}>
      <TouchableWithoutFeedback onPress={() => setModalType(null)}>
        <View style={styles.bottomSheetOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
              <Text style={styles.sheetTitle}>Move to Project</Text>
              <FlatList
                data={projectList}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.projectItem,
                      selectedProject === item.id && styles.selectedProjectItem,
                    ]}
                    onPress={() => setSelectedProject(item.id)}
                  >
                    <Ionicons name="folder-outline" size={22} color="#1976d2" style={{ marginRight: 8 }} />
                    <Text style={styles.projectName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={{ color: '#888', marginBottom: 10 }}>No projects yet.</Text>
                }
              />
              <TextInput
                placeholder="# New Project"
                value={newProjectName}
                onChangeText={setNewProjectName}
                style={styles.input}
              />
              <TouchableOpacity onPress={handleMoveToProject} style={styles.sheetActionBtn}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderContextModal = () => (
    <Modal visible={modalType === 'context'} animationType="slide" transparent onRequestClose={() => setModalType(null)}>
      <TouchableWithoutFeedback onPress={() => setModalType(null)}>
        <View style={styles.bottomSheetOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
              <Text style={styles.sheetTitle}>Move to Next Action</Text>
              <FlatList
                data={contextList}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.projectItem,
                      selectedContext === item.id && styles.selectedProjectItem,
                    ]}
                    onPress={() => setSelectedContext(item.id)}
                  >
                    <Ionicons name="at-outline" size={22} color="#43a047" style={{ marginRight: 8 }} />
                    <Text style={styles.projectName}>{item.context_name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={{ color: '#888', marginBottom: 10 }}>No contexts yet.</Text>
                }
              />
              <TextInput
                placeholder="@ New Context"
                value={newContextName}
                onChangeText={setNewContextName}
                style={styles.input}
              />
              <TouchableOpacity onPress={handleMoveToNext} style={styles.sheetActionBtn}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal visible={modalType === 'edit'} animationType="slide" transparent onRequestClose={() => setModalType(null)}>
      <TouchableWithoutFeedback onPress={() => setModalType(null)}>
        <View style={styles.bottomSheetOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
              <Text style={styles.sheetTitle}>Edit Task</Text>
              <TextInput
                style={styles.titleInput}
                value={editableTask.title}
                onChangeText={(text) =>
                  setEditableTask({ ...editableTask, title: text })
                }
              />
             { editableTask.description ? (<TextInput
                style={styles.descInput}
                value={editableTask.description}
                onChangeText={(text) =>
                  setEditableTask({ ...editableTask, description: text })
                }
              /> ) : null }

              <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: 3, gap: 4}} onPress={() => setShowDatePicker(true)}>
                      <Ionicons name="calendar-outline" size={21} color="#007BFF" style={{ marginRight: 6 }} />
                      <Text style={styles.dueText}>
                        {editableTask.dueDate
                          ? new Date(editableTask.dueDate).toDateString()
                          : 'No due date'}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={editableTask.dueDate ? new Date(editableTask.dueDate) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        onChange={(e, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            setEditableTask({ ...editableTask, dueDate: selectedDate.toISOString() });
                          }
                        }}
                      />
                    )}
              <TouchableOpacity
                onPress={() => {
                  updateTask(editableTask);
                  setModalType(null);
                }}
                style={[styles.sheetActionBtn, { marginTop: 18 }]}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // --- Main Modal ---
  return (
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modal}>
                 <StatusBar backgroundColor="#f6f8fa" barStyle="dark-content" />
                {/* Task Info */}
                <View style={styles.headerRow}>

                  <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: -2}}>
                    {/* Complete Circle */}
                  <View style={styles.circleCol}>
                    <TouchableOpacity
                      onPress={handleComplete}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.circleBtn}
                    >
                      {editableTask.completed ? (
                        <Ionicons name="checkmark-circle" size={28} color="#4caf50" />
                      ) : (
                        <Ionicons name="ellipse-outline" size={28} color="#757575" />
                      )}
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.taskTitle}>{editableTask.title}</Text>
                  </View>
                  
                    
                  {/* Description Row */}
                    {editableTask.description ? (
                      <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 1}}>
                        <Ionicons name="document-text-outline" size={24} color="#757575" style={{ marginRight: 6 }} />
                        <Text style={styles.descText}>{editableTask.description}</Text>
                      </View>
                    ) : null}

       {/* Calendar Row */}
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: 3, gap: 4}} onPress={() => setShowDatePicker(true)}>
                      <Ionicons name="calendar-outline" size={21} color="#757575" style={{ marginRight: 6 }} />
                      <Text style={styles.dueText}>
                        {editableTask.dueDate
                          ? new Date(editableTask.dueDate).toDateString()
                          : 'No due date'}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker  && !editableTask.completed && (
                      <DateTimePicker
                        value={editableTask.dueDate ? new Date(editableTask.dueDate) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        onChange={(e, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            setEditableTask({ ...editableTask, dueDate: selectedDate.toISOString() });
                          }
                        }}
                      />
                    )}
                 
                  {/* Meta Chips */}
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>

                    
                    <View style={styles.metaChip}>
                      <MaterialIcons name="flag" size={14} color={PRIORITY_COLORS[(editableTask.priority || 1) - 1]} />
                      <Text style={styles.metaChipText}>P{editableTask.priority || 1}</Text>
                    </View>

                    {editableTask.projectId ? (
                      <View style={styles.metaChip}>
                        <Ionicons name="folder" size={14} color="#1976d2" />
                        <Text style={styles.metaChipText}>
                          {projectList.find(p => p.id === editableTask.projectId)?.name || 'Project'}
                        </Text>
                      </View>
                    ) : null}

                    {editableTask.nextActionId ? (
                      <View style={styles.metaChip}>
                        <Ionicons name="at-outline" size={16} color="#43a047" />
                        <Text style={styles.metaChipText}>
                          {state.contexts.find(c => c.id === editableTask.nextActionId)?.context_name || 'Context'}
                        </Text>
                      </View>
                    ) : null}

                  </View>

                 
                </View>


               {editableTask.completed ? null : (<View style={{ marginVertical: 2 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.pillRow}>
                      <TouchableOpacity style={styles.pillBtn} onPress={() => setModalType('priority')}>
                        <MaterialIcons name="flag" size={18} color="#757575" />
                        <Text style={styles.pillText}>Priority</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.pillBtn} onPress={() => setModalType('project')}>
                        <Ionicons name="folder" size={18} color="#757575" />
                        <Text style={styles.pillText}>Project</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.pillBtn} onPress={() => setModalType('context')}>
                        <Ionicons name="at" size={20} color="#757575" />
                        <Text style={styles.pillText}>Next Action</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.pillBtn} onPress={() => setModalType('edit')}>
                        <Ionicons name="create" size={18} color="#757575" />
                        <Text style={styles.pillText}>Edit Task</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
  )}

                {/* Save/Cancel */}
                {editableTask.completed ?  (
                  <View  style={styles.placeSaveBtn}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                </View>
                ) : (
                  <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
                )}
                
                {/* 
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={{ color: '#f44336', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
                */}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
        {renderPriorityModal()}
        {renderProjectModal()}
        {renderContextModal()}
        {renderEditModal()}
    
      </Modal>
  );
};

export default TaskDetailModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modal: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 22,
    paddingBottom: 30,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 16,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    flex: 1,
    flexWrap: 'wrap',
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  descText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 6,
    flex: 1,
    flexWrap: 'wrap',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginTop: 2,
    marginLeft: 3,
  },
  metaChipText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#333',
  },
  dueText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 2,
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 18,
    gap: 8,
  },

  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 6,
    marginTop: 2,
    elevation: 0,
  },
  pillText: {
    marginLeft: 6,
    fontWeight: '600',
    color: '#222',
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  placeSaveBtn: {
    backgroundColor: '#77afeaff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  closeBtn: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  

  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 22,
    minHeight: 220,
    maxHeight: '60%',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    gap: 8,
  },
  priorityFlag: {
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f6f8fa',
    width: 60,
  },
  selectedFlag: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  flagLabel: {
    marginTop: 4,
    fontWeight: '600',
    color: '#222',
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedProjectItem: {
    backgroundColor: '#e3f2fd',
  },
  projectName: {
    fontSize: 16,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    marginTop: 8,
    fontSize: 15,
  },
  sheetActionBtn: {
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginTop: 8,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 4,
    flex: 1,
    flexWrap: 'nowrap',
  },
  descInput: {
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 4,
    flex: 1,
    flexWrap: 'wrap',
  },
  circleCol: {
    alignItems: 'flex-start',
    marginRight: 10,
    marginTop: 2,
  },
  circleBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});