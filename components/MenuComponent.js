import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';

const MenuComponent = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const navigateTo = (screen) => {
    setModalVisible(false);
    navigation.navigate(screen);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.menuIcon}>
        <Ionicons name="ellipsis-vertical" size={24} color="#444" />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('ActivityLog')}>
                <Feather name="activity" size={24} color="#444" />
                <Text style={styles.menuItemText}>Activity Log</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Settings')}>
                <Ionicons name="settings-outline" size={22} color="#444" />
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  menuIcon: {
    padding: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 12,
    paddingRight: 2,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    marginRight: 17,
  },
});

export default MenuComponent;
