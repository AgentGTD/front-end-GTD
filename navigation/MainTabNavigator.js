import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TodayScreen from '../screens/TodayScreen';
import InboxScreen from '../screens/InboxScreen';
import ProjectsStack from './ProjectsStackNavigator';
import NextActionsScreen from '../screens/NextActionsScreen';
import AddTaskModal from '../screens/NewTaskScreen'; 

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = Dimensions.get('window');

  // Compute a responsive base height between 56 and 88 depending on screen height
  const baseHeight = Math.max(56, Math.min(88, Math.round(windowHeight * 0.09)));
  const bottomPadding = Math.max(insets.bottom, 8);
  const tabBarHeight = baseHeight + (Platform.OS === 'android' ? Math.max(insets.bottom, 0) : insets.bottom);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#FBFAF8',
            height: tabBarHeight,
            borderTopWidth: 0.5,
            borderTopColor: '#ccc',
            paddingBottom: bottomPadding,
            paddingTop: Math.round(baseHeight * 0.17),
            paddingHorizontal: 2,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            textOverflow: 'ellipsis',
            
          },
          tabBarButton: (props) => <TouchableOpacity {...props} activeOpacity={0.7} />,
      
          tabBarIcon: ({ color, focused }) => {
            let iconName;
            if (route.name === 'Today') iconName = focused ? 'calendar' : 'calendar-outline';
            else if (route.name === 'Inbox') iconName = focused ? 'mail' : 'mail-outline';
            else if (route.name === 'Projects') iconName = focused ? 'briefcase' : 'briefcase-outline';
            else if (route.name === 'Actions') iconName = focused ? 'flash' : 'flash-outline';

            return (
              <View style={[styles.tabIconContainer, focused && styles.activeTabIconContainer]}>
                <Ionicons name={iconName} size={24} color={color} />
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Today" component={TodayScreen}  />
        <Tab.Screen name="Inbox" component={InboxScreen} />
        <Tab.Screen
          name="AddTaskCenter"
          component={View}
          options={{
            tabBarButton: (props) => (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.newTaskButton}
                onPress={() => setModalVisible(true)}
              >
                <View style={styles.newTaskIconContainer}>
                  <Ionicons name="add" size={32} color="white" />
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen 
          name="Projects" 
          component={ProjectsStack}
          options={{ 
            headerShown: false,
            listeners: ({ navigation }) => ({
              tabPress: e => {
                // Prevent default if we're handling a deep link
                if (navigation.isFocused()) {
                   e.preventDefault();
                }
              }
            })
          }}
        />
        <Tab.Screen name="Actions" component={NextActionsScreen} />
      </Tab.Navigator>
      
      {/* AddTask Modal */}
      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeTabIconContainer: {
    backgroundColor: '#e0f7fa',
    borderRadius: 20,
  },
  newTaskButton: {
    top: -30, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  newTaskIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF', 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
});
