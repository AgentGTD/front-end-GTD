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
        options={({ route }) => ({  title: route.params.projectName || 'Project Details', headerShown: true, headerBackgroundColor: '#f6f8fa', headerTransparent: true })} 
        

      />
    </Stack.Navigator>
  );
}
