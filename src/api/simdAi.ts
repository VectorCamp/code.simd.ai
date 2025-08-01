import { getApiToken } from '../config';

export async function callSimdAiWithHistory(messages: { role: string; content: string }[]): Promise<string> {
  const apiToken = getApiToken();
  if (!apiToken) return '⚠️ API token missing';

  try {
    const res = await fetch('https://simd.ai/api/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify({
        model: 'SIMD-ai-2506.1.ai:24b',
        messages
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('SIMD.ai error:', errorText);
      return `⚠️ SIMD.ai error: ${res.statusText}`;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '⚠️ No response content.';

  } catch (err: any) {
    console.error('SIMD.ai fetch failed:', err);
    return `⚠️ SIMD.ai call failed: ${err.message}`;
  }
}
