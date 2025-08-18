import { getApiToken } from '../config';
import { API_KEY_VIEW_C_INTRINSIC,API_KEY_INTRINSIC_NAMES } from '../config';



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

let cachedIntrinsics: string[] | null = null;

export async function fetchIntrinsicNames(): Promise<string[]> {
  if (cachedIntrinsics) return cachedIntrinsics; // return from cache if available

  try {
    const response = await fetch('https://staging.simd.info:8192/api/intrinsic-names/', {
      headers: {
        'X-API-Key': API_KEY_INTRINSIC_NAMES
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch intrinsic names:', response.statusText);
      return [];
    }

    const json = await response.json();

    if (
      typeof json === 'object' &&
      json !== null &&
      'intrinsics' in json &&
      typeof (json as any).intrinsics === 'string'
    ) {
      const text = (json as any).intrinsics;
      cachedIntrinsics = text
        .split(/\s+/)
        .map(s => s.trim())
        .filter(Boolean);

      return cachedIntrinsics || [];
    }

    console.error('Unexpected response structure:', json);
    return [];
  } catch (err) {
    console.error('Error fetching intrinsic names:', err);
    return [];
  }
}

interface Prototype {
  key: string;
  output?: string;
  inputs?: string[];
  asm?: string;
  example?: string;
}

interface TooltipData {
  name: string;
  purpose: string;
  result?: string;
  simd?: string;
  notes?: string;
  engine?: string;
  link_to_doc?: string;
  asm?: string; 
  prototypes?: Prototype[];
  example?: string;    
}

export async function fetchIntrinsicInfo(word: string): Promise<TooltipData | null> {
  try {
    const response = await fetch(`https://staging.simd.info:8192/api/c_intrinsic/${encodeURIComponent(word)}`, {
      headers: {
        'X-API-Key': API_KEY_VIEW_C_INTRINSIC
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch intrinsic for "${word}":`, response.statusText);
      return null;
    }

    const data = (await response.json()) as TooltipData;
    return data;

  } catch (err) {
    console.error(`Error fetching intrinsic for "${word}":`, err);
    return null;
  }
}