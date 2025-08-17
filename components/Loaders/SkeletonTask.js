import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';

export default function SkeletonTask() {
  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{ loop: true, type: 'timing', duration: 800 }}
      style={styles.container}
    >
      <View style={styles.circle} />
      <View style={styles.line} />
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  line: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
});
