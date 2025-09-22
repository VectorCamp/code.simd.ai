import { get } from 'http';
import { getApiToken } from '../config';
import { PLUGIN_DEFAULT_TOKEN } from '../config';


export async function callSimdAiWithHistory(messages: { role: string; content: string }[]): Promise<string> {
  const apiToken = getApiToken();
  if (!apiToken) {return '⚠️ API token missing';}

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

    const data: any = await res.json();
    return data.choices?.[0]?.message?.content ?? '⚠️ No response content.';

  } catch (err: any) {
    console.error('SIMD.ai fetch failed:', err);
    return `⚠️ SIMD.ai call failed: ${err.message}`;
  }
}

let cachedIntrinsics: string[] | null = null;

export async function fetchIntrinsicNames(): Promise<string[]> {
  let apiToken = getApiToken();

  // if user has not specified api token, use predifined to only see Intel intrinsics
  if (!apiToken) {
    apiToken = PLUGIN_DEFAULT_TOKEN;
  }

  if (cachedIntrinsics) {
    return cachedIntrinsics; // return from cache if available
  }

  try {
    const response = await fetch('https://simd.ai/api/v1/plugin-intrinsics-list/get-intrinsics-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiToken
      })
    });

    if (!response.ok) {
      console.error('Failed to fetch intrinsic names:', response.statusText);
      return [];
    }

    const json = await response.json();
    
    // Access the nested structure
    if (
      typeof json === 'object' &&
      json !== null &&
      'intrinsics_list' in json &&
      typeof json.intrinsics_list === 'object' &&
      json.intrinsics_list !== null &&
      'intrinsics' in json.intrinsics_list &&
      typeof json.intrinsics_list.intrinsics === 'string'
    ) {
      const text = json.intrinsics_list.intrinsics;
      cachedIntrinsics = text
        .split(/\s+/)
        .map((s: string) => s.trim())
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
  architectures?: Architecture[]; 
}
interface Architecture {
  simd?: string;
  architecture?: string;
  purpose?: string;
  prototypes?: Prototype[];
  link_to_doc?: string;
}

export async function fetchIntrinsicInfo(word: string): Promise<TooltipData | null> {
  let apiToken = getApiToken();

  // if user has not specified api token, use predifined to only see Intel intrinsics
  if (!apiToken) {
    apiToken = PLUGIN_DEFAULT_TOKEN;
  }
  
  try {
    const response = await fetch(`https://simd.ai/api/v1/plugin-intrinsic-info/get-intrinsics-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiToken,
        intrinsic_name: word
      })
    });

    if (!response.ok) {
      console.error(`Failed to fetch intrinsic for "${word}":`, response.statusText);
      return null;
    }

    const data: any = await response.json();
    
    // Check if intrinsic_info exists in the response
    if (!data.intrinsic_info) {
      console.error(`No intrinsic info found for "${word}"`);
      return null;
    }
    
    // Extract and transform the intrinsic_info to match TooltipData structure
    const intrinsicInfo = data.intrinsic_info;
    const tooltipData: TooltipData = {
      ...intrinsicInfo
    };
    
    return tooltipData;
  } catch (err) {
    console.error(`Error fetching intrinsic for "${word}":`, err);
    return null;
  }
}