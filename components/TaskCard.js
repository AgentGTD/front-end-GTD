import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTaskContext } from '../context/TaskContext';

//const PRIORITY_COLORS = ['#e53935', '#fb8c00', '#1976d2', '#43a047', '#757575'];

const TaskCard = ({ task, onPress, onComplete }) => {
  const { state } = useTaskContext();

  // Get project name if any
  const projectName = task.projectId
    ? state.projects.find(p => p.id === task.projectId)?.name
    : null;

  // Get context if any
  const contextName = task.nextActionId
    ? state.contexts.find(c => c.id === task.nextActionId)?.context_name
    : null;

  // Get bottom right label
  let bottomLabel = '';
  let bottomIcon = null;
  if (projectName) {
    bottomLabel = projectName;
    bottomIcon = <Ionicons name="briefcase-outline" size={16} color="#1976d2" />;
  } else if (contextName) {
    bottomLabel = "Context";
    bottomIcon = <Ionicons name="flash-outline" size={16} color="#43a047" />;
  } else if (task.category === 'inbox') {
    bottomLabel = 'Inbox';
    bottomIcon = <Ionicons name="mail-outline" size={16} color="#b71c1c" />;
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onComplete}
      activeOpacity={0.8}
    >
      {/* Complete Circle */}
      <TouchableOpacity
        style={styles.circle}
        onPress={onComplete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {task.completed ? (
          <Ionicons name="checkmark-circle" size={28} color="#4caf50" />
        ) : (
          <Ionicons name="ellipse-outline" size={28} color="#bbb" />
        )}
      </TouchableOpacity>

      {/* Task Info */}
      <View style={styles.info}>
        <Text
          style={[
            styles.title,
            task.completed && { textDecorationLine: 'line-through', color: '#aaa' },
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        {task.description ? (
          <Text
            style={[
              styles.desc,
              task.completed && { textDecorationLine: 'line-through', color: '#bbb' },
            ]}
            numberOfLines={2}
          >
            {task.description}
          </Text>
        ) : null}

        {/* Meta Row */}
        <View style={styles.metaRow}>
          {task.dueDate ? (
            <View style={[styles.metaChip,  ]}>
              <MaterialIcons name="event" size={14} color="#b71c1c" />
              <Text style={styles.metaChipText}>
                {new Date(task.dueDate).toLocaleDateString()}
              </Text>
            </View>
          ) : null}
          {/*
          <View style={styles.metaChip}>
            <MaterialIcons
              name="flag"
              size={14}
              color={PRIORITY_COLORS[(task.priority || 1) - 1]}
            />
            <Text style={styles.metaChipText}>P{task.priority}</Text>
          </View>
            
          {/* Next Action Context Pill */}
          {contextName && (
            <View style={[styles.metaChip, { backgroundColor: '#e8f5e9'}]}>
              <Ionicons name="at" size={16} color="#43a047" style={{ marginRight: -2 }} />
              <Text style={[styles.metaChipText, { color: '#388e3c', fontWeight: 'bold' }]}>
                {contextName}
              </Text>
            </View>
          )}

        {bottomLabel !== "Context" && (
          <View style={styles.metaChip}>
            {bottomIcon}
          <Text style={styles.metaChipText}>{bottomLabel}</Text>
          </View>
        )}

        </View>
    
      </View>
   
  </TouchableOpacity>
  );
};

export default TaskCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
  },
  completedCard: {
    backgroundColor: '#f9f9f9',
    elevation: 0,
  },
  circle: {
    marginRight: 14,
    marginTop: 2,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  desc: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center', 
    flexWrap: 'nowrap',   
    marginTop: 4,
    justifyContent: 'flex-start',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginTop: 2,
  },
  metaChipText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#333',
  },
  bottomRight: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },

});