import * as vscode from 'vscode';
import { getIntrinsics } from './intrinsicsCache';
import { fetchTooltip } from './api/tooltipFetcher';

let intrinsics: string[] = [];

export async function activate(context: vscode.ExtensionContext) {
  try {
    intrinsics = await getIntrinsics();
    intrinsics.sort(); // required for binary search
  } catch (err) {
    console.error('Failed to fetch intrinsics:', err);
    intrinsics = [];
  }

  const languages = ['rust', 'c', 'cpp'];

  const provider = vscode.languages.registerCompletionItemProvider(
    languages.map(lang => ({ scheme: 'file', language: lang })),
    {
        provideCompletionItems(document, position) {
          const linePrefix = document.lineAt(position).text.substring(0, position.character);
          
          // Match full identifier including underscores
          const wordMatch = linePrefix.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
          const prefix = wordMatch ? wordMatch[0] : '';
          
          if (!prefix) return undefined;
          
          const start = lowerBound(intrinsics, prefix);
          const maxResults = 50;
          const items: vscode.CompletionItem[] = [];
          
          for (let i = start; i < intrinsics.length && items.length < maxResults; i++) {
              if (!intrinsics[i].startsWith(prefix)) break;
              const name = intrinsics[i];
              const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function);
              item.detail = 'SIMD.info Intrinsic';
              
              // Important: set these properties to improve filtering
              item.filterText = name;
              item.sortText = name;
              
              items.push(item);
          }
          return items;
        },
        async resolveCompletionItem(item: vscode.CompletionItem) {
          try {
              const doc = await fetchTooltip(item.label.toString());
              if (doc) item.documentation = new vscode.MarkdownString(doc);
          } catch {}
        return item;
        }
    },
    '_','m','v' // trigger characters
    );


  context.subscriptions.push(provider);
}

// Returns the index of the first string >= prefix
function lowerBound(arr: string[], prefix: string) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] < prefix) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
