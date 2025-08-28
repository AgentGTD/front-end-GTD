import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 5}}>
                <Ionicons name="arrow-back" size={24} color="#222" />
            </TouchableOpacity>
            <Text style={styles.header}>Settings</Text>
        </View>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Account')}>
          <Ionicons name="person-circle-outline" size={28} color="#444" />
          <Text style={styles.itemText}>Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginLeft: 10,
  },
  item: {
    backgroundColor: '#f6f8fa',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemText: {
    color: '#222',
    flex: 1,
    fontSize: 20,
    marginLeft: 16,
  },
});

export default SettingsScreen;  