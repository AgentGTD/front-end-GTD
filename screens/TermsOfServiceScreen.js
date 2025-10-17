import React from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TermsOfServiceScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.header}>Terms of Service</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>FlowDo – Terms of Service</Text>
          <Text style={styles.meta}><Text style={{fontWeight: '700'}}>Effective Date:</Text> 18th August 2025</Text>
          <Text style={styles.meta}><Text style={{fontWeight: '700'}}>Last Updated:</Text> 18th August 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.paragraph}>These Terms govern your use of FlowDo's app and services. By using our services you agree to these terms. Please read carefully.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>By accessing FlowDo you agree to be bound by these Terms. We may modify Terms and will notify you of material changes.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Description of Services</Text>
            <Text style={styles.paragraph}>FlowDo provides task & project management, AI assistance, goal tracking, time management, sync across devices, and customizable workflows.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Eligibility and Account</Text>
            <Text style={styles.paragraph}>You must be 13+. You are responsible for keeping account credentials secure and for actions taken under your account.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Subscription & Payments</Text>
            <Text style={styles.paragraph}>We offer Free, Premium, and Enterprise plans. Fees are billed in advance; refunds are limited as described in the web policy.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Acceptable Use</Text>
            <Text style={styles.paragraph}>Use services lawfully. Prohibited activities include illegal uses, interfering with services, sharing credentials, reverse engineering, etc.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Disclaimers & Liability</Text>
            <Text style={styles.paragraph}>Services are provided "AS IS". FlowDo disclaims warranties. Liability is limited as described in the web Terms.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.paragraph}>Legal: legal@flowdo.com{'\n'}Support: support@flowdo.com{'\n'}Address: [Your Business Address], India</Text>
          </View>

          <View style={styles.note}>
            <Text style={styles.noteText}>Important: These Terms are designed to comply with applicable laws. For legal advice consult an attorney.</Text>
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
