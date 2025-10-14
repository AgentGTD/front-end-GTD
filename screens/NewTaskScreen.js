import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, Modal, Animated, PanResponder } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTaskContext } from '../context/TaskContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const PRIORITY_COLORS = ['#e53935', '#fb8c00', '#1976d2', '#43a047', '#757575'];

const AddTaskModal = ({ visible, onClose, defaultProjectId, defaultCategory, defaultNextActionId }) => {
  const { addTask } = useTaskContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(3);
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const inputRef = useRef(null);
  const isClosingRef = useRef(false);

  const safeClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    onClose();
  };

  // Drag-to-dismiss state
  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 4,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.8) {
          Animated.timing(translateY, {
            toValue: 400,
            duration: 160,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            safeClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
      },
    })
  ).current;

  // Fade backdrop when modal visibility changes
  useEffect(() => {
    if (visible) {
      Animated.timing(backdropOpacity, {
        toValue: 0.5,
        duration: 180,
        useNativeDriver: true,
      }).start();
    } else {
      backdropOpacity.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      isClosingRef.current = false;
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [visible]);

  const formatDueDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    if (dateObj.getTime() === today.getTime()) {
      return 'Today';
    } else if (dateObj.getTime() === today.getTime() + 86400000) {
      return 'Tomorrow';
    } else {
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority(3);
    setDueDate(new Date());
  };

  const handleAdd = () => {
    if (!title.trim()) return;

    // Fire-and-close: optimistic add ensures the list updates instantly.
    addTask(
      title,
      description,
      dueDate.toISOString(),
      priority,
      defaultCategory || 'inbox',
      defaultProjectId || null,
      defaultNextActionId || null
    );

    safeClose();
    resetForm();
  };

  const renderPriorityModal = () => (
    <Modal visible={showPriorityModal} animationType="slide" transparent onRequestClose={() => setShowPriorityModal(false)}>
      <TouchableWithoutFeedback onPress={() => setShowPriorityModal(false)}>
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
                      priority === p && styles.selectedFlag,
                      { borderColor: PRIORITY_COLORS[idx] },
                    ]}
                    onPress={() => {
                      setPriority(p);
                      setShowPriorityModal(false);
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={safeClose}
      onBackdropPress={safeClose}
      onSwipeComplete={safeClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={() => {
        setShowPriorityModal(false);
        setShowPicker(false);
        safeClose();
      }}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <Animated.View style={[styles.modal, { transform: [{ translateY }] }]}>
                <View style={styles.modalHeader} {...panResponder.panHandlers}>
                  <View style={styles.sheetHandle} />
                  <Text style={styles.modalTitle}>New Task</Text>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.titleInput}
                    placeholder="What needs to be done?"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor="#999"
                    autoFocus
                  />

                  <TextInput
                    style={styles.descriptionInput}
                    placeholder="Description"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.optionsRow}>
                  {/* Calendar Button */}
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => setShowPicker(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="calendar" size={20} color="#757575" />
                    <Text style={styles.optionButtonText}>
                      {formatDueDate(dueDate)}
                    </Text>
                  </TouchableOpacity>

                  {/* Priority Button */}
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => setShowPriorityModal(true)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="flag" size={20} color="#757575" />
                    <Text style={styles.optionButtonText}>Priority</Text>
                    <Text style={[styles.priorityLabel, { color: PRIORITY_COLORS[priority - 1] }]}>
                      {' P' + priority}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: title.trim() ? '#007AFF' : '#E0E0E0' }
                  ]}
                  onPress={handleAdd}
                  disabled={!title.trim()}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={24} color="white" />
                  <Text style={styles.actionButtonText}>Create Task</Text>
                </TouchableOpacity>
              </Animated.View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(e, date) => {
            setShowPicker(false);
            if (date) setDueDate(date);
          }}
        />
      )}

      {/* Priority Modal */}
      {renderPriorityModal()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    minHeight: 300,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  inputContainer: {
    marginBottom: 24,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    paddingVertical: 16,
    marginBottom: 16,
    color: '#222',
  },
  descriptionInput: {
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    fontSize: 16,
    color: '#555',
    paddingVertical: 12,
    minHeight: 40,
    lineHeight: 22,
  },
  optionsRow: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  optionButton: {
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
  optionButtonText: {
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  priorityLabel: {
    marginLeft: 2,
    fontWeight: 'bold',
    fontSize: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 22,
    minHeight: 180,
    maxHeight: '60%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 6,
  },
  priorityFlag: {
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f6f8fa',
    width: 60,
    marginHorizontal: 4,
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
});

export default AddTaskModal;
