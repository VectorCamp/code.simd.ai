import fetch from 'node-fetch';
(globalThis as any).fetch = fetch;

import * as vscode from 'vscode';
import { fetchIntrinsicInfo } from './simdAi';



process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Dev only — allow self-signed certs

const tooltipCache: Record<string, string> = {};



export async function fetchTooltip(word: string): Promise<string> {
  if (tooltipCache[word]) {return tooltipCache[word];}

  try {
    const data = await fetchIntrinsicInfo(word);
    if (!data) {
      console.warn(`No tooltip found for "${word}"`);
      return '';
    }
    
    const md = new vscode.MarkdownString();
    md.isTrusted = true;
    md.supportHtml = true;

   
    // Handle new structure with multiple architectures
    if (Array.isArray(data.architectures) && data.architectures.length > 0) {
      for (const arch of data.architectures) {

        
        const { simd, architecture, purpose, prototypes = [], link_to_doc } = arch;

        const simdLink = `https://staging.simd.info:8192/c_intrinsic/${encodeURIComponent(data.name)}?engine=${simd}`;

        const titleLine = [`**${simd || ''}**`, architecture || ''].filter(Boolean).join(' - ');
        md.appendMarkdown(`### [${data.name}](${simdLink})${titleLine ? ` (${titleLine})` : ''}\n`);
        const plainPurpose = purpose?.replace(/<\/?[^>]+(>|$)/g, '').trim();
        if (plainPurpose) {
          md.appendMarkdown(`${plainPurpose}\n`);
        }

        if (prototypes.length) {
          md.appendMarkdown(`\n**Prototypes:**\n`);
          for (const proto of prototypes) {
            const inputList = proto.inputs?.join(', ') || '';
            const line = `${proto.output || 'void'} variable = ${proto.key}(${inputList});`;
            md.appendMarkdown('```c\n' + line + '\n```\n');
          }
        }
      }
    } else {
      const simdLink = `https://staging.simd.info:8192/c_intrinsic/${encodeURIComponent(data.name)}?engine=${data.engine || ''}`;

         
      const simdInfo = [data.simd, data.engine].filter(Boolean).join(' : ');
      md.appendMarkdown(`### [${data.name}](${simdLink})${simdInfo ? ` (${simdInfo})` : ''}\n`);
      if (simdInfo) {md.appendMarkdown(`(${simdInfo})\n`);}

      const purpose = data.purpose?.replace(/<\/?[^>]+(>|$)/g, '').trim();
      if (purpose) {md.appendMarkdown(`${purpose}\n`);}

      if (data.notes?.trim()) {
        md.appendMarkdown(`**Notes:** ${data.notes.trim()}\n`);
      }

      if (Array.isArray(data.prototypes) && data.prototypes.length > 0) {
        md.appendMarkdown(`\n**Prototypes:**\n`);
        for (const proto of data.prototypes) {
          const inputList = proto.inputs?.join(', ') || '';
          const line = `${proto.output || 'void'} variable = ${proto.key}(${inputList});`;
          md.appendMarkdown('```c\n' + line + '\n```\n');

        }
      }
    }

    const markdown = md.value;
    tooltipCache[word] = markdown;
    return markdown;
  } catch (error) {
    console.error('Failed to fetch tooltip for', word, error);
    return '';
  }
}
