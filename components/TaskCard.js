import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTaskContext } from '../context/TaskContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    bottomLabel = 'Context';
    bottomIcon = <Ionicons name="flash-outline" size={16} color="#43a047" />;
  } else if (task.category === 'inbox') {
    bottomLabel = 'Inbox';
    bottomIcon = <Ionicons name="mail-outline" size={16} color="#b71c1c" />;
  }

  return (
    <TouchableOpacity
      style={[styles.card, task.completed && styles.completedCard]}
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
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {task.title}
        </Text>

        {task.description ? (
          <Text
            style={[
              styles.desc,
              task.completed && { textDecorationLine: 'line-through', color: '#bbb' },
            ]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {task.description}
          </Text>
        ) : null}

        {/* Meta Row */}
        <View style={styles.metaRow}>
          {task.dueDate && (
            <View style={styles.metaChip}>
              <MaterialIcons name="event" size={14} color="#b71c1c" />
              <Text style={styles.metaChipText}>
                {new Date(task.dueDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          {contextName && (
            <View style={[styles.metaChip, { backgroundColor: '#e8f5e9' }]}>
              <Ionicons name="at" size={16} color="#43a047" style={{ marginRight: -2 }} />
              <Text
                style={[styles.metaChipText, { color: '#388e3c', fontWeight: 'bold' }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {contextName}
              </Text>
            </View>
          )}

          {bottomLabel !== 'Context' && bottomLabel !== '' && (
            <View style={styles.metaChip}>
              {bottomIcon}
              <Text
                style={styles.metaChipText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {bottomLabel}
              </Text>
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
    padding: SCREEN_WIDTH > 600 ? 20 : 14, // adaptive padding
    marginBottom: 14,
    width: SCREEN_WIDTH > 600 ? '90%' : '100%', // tablet vs phone
    alignSelf: 'center',

    // Shadow (iOS) + Elevation (Android)
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
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
    fontSize: SCREEN_WIDTH > 600 ? 19 : 17, // adaptive text size
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  desc: {
    color: '#666',
    fontSize: SCREEN_WIDTH > 600 ? 16 : 14,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginTop: 4,
    maxWidth: '100%',
  },
  metaChipText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#333',
    flexShrink: 1, 
  },
});
