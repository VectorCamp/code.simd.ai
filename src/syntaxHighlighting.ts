/*
* Copyright (c) 2025, VectorCamp PC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import * as vscode from 'vscode';
import * as fs from 'fs';
import { fetchTooltip } from './api/tooltipFetcher';
import { fetchIntrinsicNames } from './api/simdAi';


let intrinsics: string[] = [];
let decorationType: vscode.TextEditorDecorationType | null = null;

export async function initIntrinsicHighlighting(context: vscode.ExtensionContext) {
  try {
    intrinsics = await fetchIntrinsicNames();
  } catch (error) {
    console.error('Failed to fetch intrinsics:', error);
  }

  if (!decorationType) {
    decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'transparent',
      fontWeight: 'bold',
      textDecoration: `
          none;
          background: linear-gradient(90deg, #FFA500, #FF8C00, #FF4500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
      `
    });
  }

  const highlightAllVisibleEditors = () => {
    vscode.window.visibleTextEditors.forEach(editor => highlightIntrinsics(editor));
  };
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => highlightAllVisibleEditors()),
    vscode.workspace.onDidChangeTextDocument(event => {
      vscode.window.visibleTextEditors
        .filter(editor => editor.document === event.document)
        .forEach(editor => highlightIntrinsics(editor));
    }),
    vscode.window.onDidChangeVisibleTextEditors(() => highlightAllVisibleEditors())
  );  

  // Highlight all editors on activation
  highlightAllVisibleEditors();
}

export async function highlightIntrinsics(editor: vscode.TextEditor) {
  if (!intrinsics.length || !decorationType) {
    // console.warn('No intrinsics loaded.');
    return;
  }


  const text = editor.document.getText();
  const decorations: vscode.DecorationOptions[] = [];

  const escapedWords = intrinsics.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'g');

  let match;
  const promises: Promise<void>[] = [];

  while ((match = regex.exec(text)) !== null) {
    const word = match[0];
    const startPos = editor.document.positionAt(match.index);
    const endPos = editor.document.positionAt(match.index + word.length);

    const promise = fetchTooltip(word).then(tooltip => {
      const hoverText = tooltip || '*Documentation not available.*'; // fallback
      const hover = new vscode.MarkdownString(hoverText);
      hover.isTrusted = true;
      decorations.push({
        range: new vscode.Range(startPos, endPos),
        hoverMessage: hover
      });
    });

    promises.push(promise);
  }

  await Promise.all(promises);
  editor.setDecorations(decorationType, decorations);
}

export function deactivateHighlighting() {
  if (decorationType) {
    decorationType.dispose();
    decorationType = null;
  }
}
