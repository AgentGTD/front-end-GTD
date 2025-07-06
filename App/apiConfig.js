import { Platform } from 'react-native';

export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://192.168.56.1:4000' 
    : 'http://localhost:4000';   
