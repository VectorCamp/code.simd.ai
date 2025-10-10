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
import { fetchDatatypeTooltip, fetchTooltip } from './api/tooltipFetcher';
import { getIntrinsics } from './intrinsicsCache';
import { fetchDatatypesByArch } from './api/datatypeFetcher';
import { HighlightConfig } from './highlightConfig';


let intrinsics: string[] = [];
let decorationType: vscode.TextEditorDecorationType | null = null;
let datatypesByArch: Record<string, string[]> = {};
const datatypeDecorationsByArch: Record<string, vscode.TextEditorDecorationType> = {};


export type HighlightMode = 'none' | 'flat' | 'gradient';
let currentMode: HighlightMode = 'gradient';
let statusBarItem: vscode.StatusBarItem | null = null;

export async function initIntrinsicHighlighting(context: vscode.ExtensionContext) {
  try {
    intrinsics = await getIntrinsics();
  } catch (error) {
    console.error('Failed to fetch intrinsics:', error);
  }

  try {
    datatypesByArch = await fetchDatatypesByArch();
  } catch (error) {
    console.error('Failed to fetch datatypes:', error);
  }


  currentMode = context.globalState.get<HighlightMode>('highlightMode', 'gradient');

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'code.simd.ai.cycleHighlightMode';
  updateStatusBar();
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Create decorations
  createDecorations();

  const highlightAllVisibleEditors = () => {
    vscode.window.visibleTextEditors.forEach(editor => highlightIntrinsicsAndDatatypes(editor));
  };
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => highlightAllVisibleEditors()),
    vscode.workspace.onDidChangeTextDocument(event => {
      vscode.window.visibleTextEditors
        .filter(editor => editor.document === event.document)
        .forEach(editor => highlightIntrinsicsAndDatatypes(editor));
    }),
    vscode.window.onDidChangeVisibleTextEditors(() => highlightAllVisibleEditors())
  );  

  // Highlight all editors on activation
  highlightAllVisibleEditors();
}

function updateStatusBar() {
  if (!statusBarItem) {return;}

  const modeIcons = {
    none: '$(circle-slash)',
    flat: '$(circle-filled)',
    gradient: '$(symbol-color)'
  };
  
  const modeLabels = {
    none: 'None',
    flat: 'Flat',
    gradient: 'Gradient'
  };

  statusBarItem.text = `${modeIcons[currentMode]} SIMD: ${modeLabels[currentMode]}`;
  statusBarItem.tooltip = 'Click to cycle SIMD syntax highlighting mode';
}

export function cycleHighlightMode(context: vscode.ExtensionContext) {
  const modes: HighlightMode[] = ['gradient', 'flat', 'none'];
  const currentIndex = modes.indexOf(currentMode);
  const nextIndex = (currentIndex + 1) % modes.length;
  currentMode = modes[nextIndex];

  // Save to global state (persistent)
  context.globalState.update('highlightMode', currentMode);

  updateStatusBar();
  updateDecorations();

  // Re-highlight all visible editors
  vscode.window.visibleTextEditors.forEach(editor => highlightIntrinsicsAndDatatypes(editor));

}

function createDecorations() {
  // Dispose old decorations
  if (decorationType) {
    decorationType.dispose();
  }
  for (const deco of Object.values(datatypeDecorationsByArch)) {
    deco.dispose();
  }

  if (currentMode === 'none') {
    // Create invisible decoration type for hover messages
    decorationType = vscode.window.createTextEditorDecorationType({
      // No visible styling at all
      backgroundColor: 'transparent',
      color: undefined,
      textDecoration: 'none;'
    });

    // Skip datatypes color, but keep tooltip links working
    return;
  }

  // Create intrinsic decoration
  if (currentMode === 'gradient') {
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
  } else if (currentMode === 'flat') {
    decorationType = vscode.window.createTextEditorDecorationType({
      color: '#FF8C00',
      fontWeight: 'bold'
    });
  }

  // Create datatype decorations by arch
  for (const arch of Object.keys(datatypesByArch)) {
    const cfg = HighlightConfig[arch.toUpperCase()] || HighlightConfig.DEFAULT;

    const style =
      currentMode === 'gradient'
        ? {
            fontWeight: 'bold',
            textDecoration: `
              none;
              background: ${cfg.gradient};
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            `,
          }
        : {
            color: cfg.flat,
            fontWeight: 'bold',
          };

    datatypeDecorationsByArch[arch] =
      vscode.window.createTextEditorDecorationType(style);
  }
}

function updateDecorations() {
  createDecorations();
}

export async function highlightIntrinsicsAndDatatypes(editor: vscode.TextEditor) {
  if ((!intrinsics.length && !Object.keys(datatypesByArch).length) || !decorationType) {return;}

  const text = editor.document.getText();
  const escape = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // === Intrinsics ===
  const intrinsicDecorations: vscode.DecorationOptions[] = [];
  const intrinsicRegex = new RegExp(`\\b(${intrinsics.map(escape).join('|')})\\b`, 'g');
  let match: RegExpExecArray | null;

  const promises: Promise<void>[] = [];
  while ((match = intrinsicRegex.exec(text)) !== null) {
    const word = match[0];
    const range = new vscode.Range(
      editor.document.positionAt(match.index),
      editor.document.positionAt(match.index + word.length)
    );
    const promise = fetchTooltip(word).then(tooltip => {
      intrinsicDecorations.push({
        range,
        hoverMessage: new vscode.MarkdownString(tooltip || '*Documentation not available.*')
      });
    });
    promises.push(promise);
  }

  // === Datatypes per arch ===
  const datatypeDecorationRanges: Record<string, vscode.DecorationOptions[]> = {};

  for (const [arch, names] of Object.entries(datatypesByArch)) {
    const regex = new RegExp(`\\b(${names.map(escape).join('|')})\\b`, 'g');
    datatypeDecorationRanges[arch] = [];

    while ((match = regex.exec(text)) !== null) {
      const word = match[0];
      const range = new vscode.Range(
        editor.document.positionAt(match.index),
        editor.document.positionAt(match.index + word.length)
      );

      const promise = fetchDatatypeTooltip(word).then(tooltip => {
        datatypeDecorationRanges[arch].push({
          range,
          // hoverMessage: new vscode.MarkdownString(tooltip || '*Documentation not available.*')
        });
      });

      promises.push(promise);
    }
  }

  await Promise.all(promises);

  editor.setDecorations(decorationType, intrinsicDecorations);

  for (const [arch, decos] of Object.entries(datatypeDecorationRanges)) {
    const decoType = datatypeDecorationsByArch[arch];
    if (decoType) {editor.setDecorations(decoType, decos);}
  }
}

export function deactivateHighlighting() {
  if (decorationType) {
    decorationType.dispose();
    decorationType = null;
  }
  for (const deco of Object.values(datatypeDecorationsByArch)) {
    deco.dispose();
  }
  if (statusBarItem) {
    statusBarItem.dispose();
    statusBarItem = null;
  }
}

export function getCurrentMode(): HighlightMode {
  return currentMode;
}