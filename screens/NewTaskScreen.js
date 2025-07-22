import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTaskContext } from '../context/TaskContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Modal from 'react-native-modal'; 

const PRIORITY_COLORS = ['#e53935', '#fb8c00', '#1976d2', '#43a047', '#757575'];

const AddTaskModal = ({ visible, onClose, defaultProjectId, defaultCategory, defaultNextActionId }) => {
  const { addTask } = useTaskContext(); 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(5);
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 100);
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

  const handleAdd = async () => {
    if (!title.trim()) return;

    await addTask(
      title,
      description,
      dueDate.toISOString(),
      priority,
      defaultCategory || 'inbox',
      defaultProjectId || null,
      defaultNextActionId || null
    );

    onClose();
    setTitle('');
    setDescription('');
    setPriority(3);
    setDueDate(new Date());
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
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      /*
      swipeDirection="down"
      animationIn="slideInUp"
      animationOut="slideOutDown"
      */
      style={{ justifyContent: 'flex-end', margin: 0 }}
      useNativeDriver
      propagateSwipe
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback>
        <View style={styles.modal}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Task Name"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#bbb"
          />
          <TextInput
            style={styles.descriptionInput}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholderTextColor="#ccc"
          />

          <View style={styles.optionsRow}>
            {/* Calendar Button */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setShowPicker(true)}
            >
              <Ionicons name="calendar" size={18} color="#757575" />
              <Text style={styles.optionButtonText}>
                {formatDueDate(dueDate)}
              </Text>
            </TouchableOpacity>

            {/* Priority Button */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setShowPriorityModal(true)}
            >
              <MaterialIcons name="flag" size={18} color="#757575" />
              <Text style={styles.optionButtonText}>Priority</Text>
              <Text style={[styles.priorityLabel, { color: PRIORITY_COLORS[priority - 1] }]}>
                {' P' + priority}
              </Text>
            </TouchableOpacity>
          </View>

          {/* FAB */}
          <TouchableOpacity
            style={[
              styles.fab,
              { backgroundColor: title.trim() ? '#007AFF' : '#ccc' }
            ]}
            onPress={handleAdd}
            disabled={!title.trim()}
          >
            <Ionicons name="send" size={28} color="white" />
          </TouchableOpacity>
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
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.18)'
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 250,
    elevation: 10,
  },
  input: {
    fontSize: 22,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
    paddingVertical: 14,
    marginBottom: 4,
    color: '#333'
  },
  descriptionInput: {
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
    fontSize: 16,
    color: '#555',
    paddingVertical: 10,
    marginBottom: 18,
    minHeight: 40
  },
  optionsRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
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
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 18,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    justifyContent: 'flex-end', 
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 22,
    minHeight: 180,
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