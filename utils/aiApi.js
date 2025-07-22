import { API_BASE_URL } from '../apiConfig';

export async function sendAIPrompt(prompt, token) {
  const res = await fetch(`${API_BASE_URL}/api/ai/assistant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error('AI API error');
  return res.json();
}