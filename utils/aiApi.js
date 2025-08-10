import { debugFetch } from './debugFetch';
import { API_BASE_URL } from '@env';


// Send an AI prompt to the backend
export async function sendAIPrompt(token, prompt, signal = null) {
     
  try {
    const requestData = { prompt };
    console.log('📤 Sending AI request data:', requestData);
    
    const res = await debugFetch(`${API_BASE_URL}/api/ai/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
      signal: signal, // Add abort signal for cancellation
    });
    
    console.log('📥 AI response received, status:', res.status);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('❌ AI API error response:', errorData);
      throw new Error(errorData.message || 'AI API error');
    }
    
    const responseData = await res.json();
    console.log('✅ AI response data:', responseData);
    return responseData;
  } catch (error) {
    console.error('❌ AI API error:', error);
    console.error('  - Error message:', error.message);
    console.error('  - Error name:', error.name);
    if (error.name === 'AbortError') {
      console.log('🛑 AI request was cancelled');
    }
    throw error;
  }
}