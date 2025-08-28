import Constants from 'expo-constants';

// Derive API_BASE_URL from expo constants extras; avoid @env for EAS builds
const API_BASE_URL = (Constants?.expoConfig?.extra?.API_BASE_URL || Constants?.manifest2?.extra?.API_BASE_URL || 'https://gtd-backend-backend-gtd-h6hi.encr.app');

// Debug logging for API configuration
console.log('🔧 API Configuration Debug:');
console.log('  - API_BASE_URL:', API_BASE_URL);
console.log('  - __DEV__:', __DEV__);
console.log('  - Platform:', require('react-native').Platform.OS);

// Enhanced fetch wrapper with detailed logging
export const debugFetch = async (url, options = {}) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`🌐 [${requestId}] API Request Debug:`);
  console.log(`  - URL: ${url}`);
  console.log(`  - Method: ${options.method || 'GET'}`);
  console.log(`  - Headers:`, options.headers || {});
  console.log(`  - Body:`, options.body ? JSON.parse(options.body) : 'None');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, options);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ [${requestId}] API Response Debug:`);
    console.log(`  - Status: ${response.status} ${response.statusText}`);
    console.log(`  - Duration: ${duration}ms`);
    console.log(`  - Headers:`, Object.fromEntries(response.headers.entries()));
    
    // Clone response to read body without consuming it
    const responseClone = response.clone();
    const responseText = await responseClone.text();
    
    console.log(`  - Response Body:`, responseText);
    
    // Try to parse as JSON if possible
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }
    
    if (!response.ok) {
      console.error(`❌ [${requestId}] API Error:`);
      console.error(`  - Status: ${response.status}`);
      console.error(`  - Error Data:`, responseData);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`💥 [${requestId}] Network Error:`);
    console.error(`  - Error:`, error.message);
    console.error(`  - Duration: ${duration}ms`);
    console.error(`  - Error Type:`, error.constructor.name);
    console.error(`  - Stack:`, error.stack);
    
    // Additional network diagnostics
    if (error.message.includes('Network request failed')) {
      console.error(`🔍 Network Diagnostics:`);
      console.error(`  - URL might be unreachable`);
      console.error(`  - Check if backend is running`);
      console.error(`  - Verify URL format and SSL`);
    }
    
    throw error;
  }
};

export const API_ENDPOINTS = {
  // Auth endpoints
  GET_USER: `${API_BASE_URL}/api/auth/user`,
  
  // Task endpoints
  GET_TASKS: `${API_BASE_URL}/api/tasks`,
  CREATE_TASK: `${API_BASE_URL}/api/tasks`,
  UPDATE_TASK: (id) => `${API_BASE_URL}/api/tasks/${id}`,
  DELETE_TASK: (id) => `${API_BASE_URL}/api/tasks/${id}`,
  TOGGLE_TASK: (id) => `${API_BASE_URL}/api/tasks/${id}/complete`,
  MOVE_TASK: (id) => `${API_BASE_URL}/api/tasks/${id}/move`,
  
  // Project endpoints
  GET_PROJECTS: `${API_BASE_URL}/api/projects`,
  CREATE_PROJECT: `${API_BASE_URL}/api/projects`,
  UPDATE_PROJECT: (id) => `${API_BASE_URL}/api/projects/${id}`,
  DELETE_PROJECT: (id) => `${API_BASE_URL}/api/projects/${id}`,
  
  // Next Actions endpoints
  GET_NEXT_ACTIONS: `${API_BASE_URL}/api/nextactions`,
  CREATE_NEXT_ACTION: `${API_BASE_URL}/api/nextactions`,
  UPDATE_NEXT_ACTION: (id) => `${API_BASE_URL}/api/nextactions/${id}`,
  DELETE_NEXT_ACTION: (id) => `${API_BASE_URL}/api/nextactions/${id}`,
  
  // AI endpoints
  AI_PROMPT: `${API_BASE_URL}/api/ai/assistant`,
};