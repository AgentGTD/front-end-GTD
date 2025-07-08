import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProjectsScreen from '../screens/ProjectsScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';

const Stack = createNativeStackNavigator();

export default function ProjectsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProjectsMain"
        component={ProjectsScreen}
        options={{ headerShown: false }}
       
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{ title: 'Project Details' }} 

      />
    </Stack.Navigator>
  );
}
