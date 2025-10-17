import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { getErrorMessage, getErrorTitle } from '../utils/errorHandler';
import { useAuthFeedback } from '../context/AuthFeedbackContext';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const { showAuthFeedback } = useAuthFeedback();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const toggleLogoutModal = () => setLogoutModalVisible(s => !s);

  const confirmLogout = async () => {
    try {
      await logout();
    } catch (err) {
      const errorTitle = getErrorTitle('logout');
      const errorMessage = getErrorMessage(err, 'auth');
      showAuthFeedback(errorTitle, errorMessage);
    } finally {
      setLogoutModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.header}>Settings</Text>
        </View>

        {/* Account section */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('Account')}
            activeOpacity={0.7}
          >
            <View style={styles.leftRow}>
              <Ionicons name="person-circle-outline" size={26} color="#444" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.itemText}>Account</Text>
                <Text style={styles.itemSub}>{user?.displayName || 'Anonymous'}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Personalization */}
        <Text style={styles.groupTitle}>Personalization</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => Alert.alert('Theme', 'Theme options coming soon')}
            activeOpacity={0.7}
          >
            <View style={styles.leftRow}>
              <Ionicons name="color-palette-outline" size={22} color="#444" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.itemText}>Theme</Text>
                <Text style={styles.itemSub}>Light / Dark / System</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* More */}
        <Text style={styles.groupTitle}>More</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('About')}
            activeOpacity={0.7}
          >
            <View style={styles.leftRow}>
              <Ionicons name="information-circle-outline" size={22} color="#444" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.itemText}>About</Text>
                <Text style={styles.itemSub}>App info & version</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <Text style={styles.groupTitle}>Legal</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            activeOpacity={0.7}
          >
            <View style={styles.leftRow}>
              <Ionicons name="document-text-outline" size={22} color="#444" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.itemText}>Privacy Policy</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('TermsOfService')}
            activeOpacity={0.7}
          >
            <View style={styles.leftRow}>
              <Ionicons name="reader-outline" size={22} color="#444" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.itemText}>Terms of Service</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Logout area */}
        <View style={styles.logoutContainer}>
          <View>
            <Text style={styles.logoutEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={toggleLogoutModal} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.logoutButtonText}> Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={confirmLogout}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f8fa' },
  container: { flex: 1, padding: 16 },

  headerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, marginBottom: 6 },
  backButton: { padding: 6 },
  header: { fontSize: 24, fontWeight: '700', color: '#222', marginLeft: 8 },

  groupTitle: { marginTop: 12, marginBottom: 8, color: '#666', fontWeight: '600' },

  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 4,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },

  leftRow: { flexDirection: 'row', alignItems: 'center' },

  itemText: { fontSize: 16, color: '#222', fontWeight: '600' },
  itemSub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },

  logoutContainer: {
    marginTop: 18,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutEmail: { color: '#666', fontSize: 14 },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  /* Modal (copied small set from AccountScreen for consistency) */
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 520 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 8 },
  modalText: { fontSize: 15, color: '#444', marginBottom: 14 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginHorizontal: 6 },
  cancelButton: { backgroundColor: '#f0f0f0' },
  modalPrimaryButton: { backgroundColor: '#007AFF' },
  modalButtonText: { fontWeight: '600', fontSize: 16, color: '#444' },
});

export default SettingsScreen;