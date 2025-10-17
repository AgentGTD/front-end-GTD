import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

export default function AboutScreen({ navigation }) {
  const appVersion =
    (Constants.manifest && Constants.manifest.version) ||
    (Constants.expoConfig && Constants.expoConfig.version) ||
    '1.0.0';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.header}>About</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>FlowDo</Text>
          <Text style={styles.subtitle}>Version</Text>
          <Text style={styles.version}>{appVersion}</Text>
        </View>

        {/* Additional about content can be added here */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f8fa' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  backButton: { padding: 6 },
  header: { fontSize: 22, fontWeight: '700', color: '#222', marginLeft: 8 },

  container: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  title: { fontSize: 20, fontWeight: '700', color: '#222' },
  subtitle: { marginTop: 12, fontSize: 14, color: '#888' },
  version: { marginTop: 6, fontSize: 18, fontWeight: '600', color: '#444' },
});
