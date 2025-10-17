import React from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.header}>Privacy Policy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>FlowDo – Privacy Policy</Text>
          <Text style={styles.meta}><Text style={{fontWeight: '700'}}>Effective Date:</Text> 18th August 2025</Text>
          <Text style={styles.meta}><Text style={{fontWeight: '700'}}>Last Updated:</Text> 18th August 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.paragraph}>
              This Privacy Policy explains how FlowDo (“we,” “us,” or “our”) collects, uses, and protects your information when you use our personal productivity mobile application and related services. By using our services, you consent to the practices described in this policy.
            </Text>
          </View>

          {/* Major sections (condensed for readability, same content basis) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.paragraph}>We collect Personal Information (name, email, profile picture), Authentication Data, Profile Information, Usage and Analytics Data, User-Generated Content, and Technical Data (logs, cookies, device info).</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.paragraph}>We use data to provide and improve services, personalize content, enable AI features, communicate updates, and comply with legal/security requirements.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Information Sharing</Text>
            <Text style={styles.paragraph}>We may share data with trusted service providers (cloud, analytics), for legal requirements, or as part of business transfers, and share aggregated anonymized data for analytics.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security and Retention</Text>
            <Text style={styles.paragraph}>We implement industry-standard measures to protect your data. Retention periods are described in the web policy (account data: until deletion or 3 years inactivity; usage analytics: 2 years; AI interaction: 1 year; logs: 90 days).</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Your Rights and Choices</Text>
            <Text style={styles.paragraph}>You can access, update, delete, export your data, and manage communication preferences. Withdraw consent where applicable.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.paragraph}>Data Protection Officer: privacy@flowdo.com{'\n'}Support: support@flowdo.com{'\n'}Address: [Your Business Address], India</Text>
          </View>

          <View style={styles.note}>
            <Text style={styles.noteText}>Note: This Privacy Policy is designed to comply with applicable data protection laws including India's DPDP Act. For legal advice consult an attorney.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f8fa' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14 },
  backButton: { padding: 6 },
  header: { fontSize: 20, fontWeight: '700', color: '#222', marginLeft: 8 },

  container: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },

  title: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 8 },
  meta: { fontSize: 13, color: '#666', marginBottom: 6 },

  section: { marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 6 },
  paragraph: { fontSize: 14, color: '#444', lineHeight: 20 },

  note: { marginTop: 12, backgroundColor: '#FEF3C7', padding: 10, borderRadius: 8 },
  noteText: { color: '#665200', fontSize: 13 },
});
