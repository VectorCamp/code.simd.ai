import fetch, { Headers, Request, Response } from 'node-fetch';

globalThis.fetch = fetch as any;
globalThis.Headers = Headers as any;
globalThis.Request = Request as any;
globalThis.Response = Response as any;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Dev only — allow self-signed certs

const tooltipCache: Record<string, string> = {};

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
  asm?: string; // For AVX/NEON style
  prototypes?: Prototype[];
  example?: string;     // For AVX/NEON style
}

export async function fetchTooltip(word: string): Promise<string> {
  if (tooltipCache[word]) return tooltipCache[word];

  try {
    const response = await fetch(`https://staging.simd.info:8192/api/c_intrinsic/${encodeURIComponent(word)}`,{
        headers: {
          'X-API-Key': 'mermigkis'
        }
    });
    if (!response.ok) return '';

    const data: TooltipData = await response.json();
    const md: string[] = [];

    const simdLink = `https://staging.simd.info:8192/c/${encodeURIComponent(data.name)}`;
    const simdInfo = [data.simd, data.engine].filter(Boolean).join(' : ');
    md.push(`### [${data.name}](${simdLink})${simdInfo ? ` (${simdInfo})` : ''}\n`);
    const purpose = data.purpose?.replace(/<\/?[^>]+(>|$)/g, '').trim();
    if (purpose) md.push(`${purpose}\n`);
    
    if (data.notes && data.notes.trim()) md.push(`**Notes:** ${data.notes.trim()}`);

    const isVSX = (data.simd?.toLowerCase() === 'ibm-z' || data.engine?.toLowerCase() === 'ibm-z');

    // Prototypes (with VSX/IBM-Z support)
    if (data.prototypes?.length) {
        md.push(`\n**Prototypes:**\n`);

        for (const proto of data.prototypes) {
            const { key, inputs = [], output = '', asm, example } = proto;

            const inputList = inputs.join(', ');
            const line = `${output} variable = ${key}(${inputList});`;
            
            // Signature
            md.push(`<details>`);
            md.push(`<summary><code>${line}</code></summary>\n`);
            // md.push('```c\n' + line + '\n```');


            // Always show example if present
            // if (typeof example === 'string' && example.trim()) {
            //     md.push('```c\n' + example.trim() + '\n```');
            // }
            if (typeof example === 'string' && example.trim()) {
                md.push('\n```c\n' + example.trim() + '\n```');
            }

            md.push(`</details>`);
        }
    }


    // Shared (non-IBM-Z) asm & example
    if (!isVSX) {
      if (typeof data.example === 'string' && data.example.trim()) {
        md.push(`\n**Example:**\n`);
        md.push('```c\n' + data.example.trim() + '\n```');
      }
    }


    const markdown = md.join('\n\n');
    tooltipCache[word] = markdown;
    console.log(`Tooltip fetched for ${word}:`, markdown);
    
    return markdown;
  } catch (error) {
    console.error('Failed to fetch tooltip for', word, error);
    return '';
  }
}
