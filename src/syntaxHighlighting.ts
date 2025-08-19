import * as vscode from 'vscode';
import * as fs from 'fs';
import { fetchTooltip } from './api/tooltipFetcher';
import { fetchIntrinsicNames } from './api/simdAi';

let decorationType: vscode.TextEditorDecorationType | null = null;
let intrinsics: string[] = [];

export async function initIntrinsicHighlighting(context: vscode.ExtensionContext) {
  // try {
  //   const intrinsicsPath = vscode.Uri.joinPath(context.extensionUri, 'resources', 'intrinsics.txt').fsPath;
  //   const content = fs.readFileSync(intrinsicsPath, 'utf8');
  //   intrinsics = content.split(/\r?\n/).filter(Boolean);
  // } catch (error) {
  //   console.error('Failed to load intrinsics:', error);
  // }

  try {
    intrinsics = await fetchIntrinsicNames();
  } catch (error) {
    console.error('Failed to fetch intrinsics:', error);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) {highlightIntrinsics(editor);}
    }),

    vscode.workspace.onDidChangeTextDocument(event => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        highlightIntrinsics(editor);
      }
    })
  );

  // Highlight on activation if an editor is already open
  if (vscode.window.activeTextEditor) {
    highlightIntrinsics(vscode.window.activeTextEditor);
  }
}

async function highlightIntrinsics(editor: vscode.TextEditor) {
  if (!intrinsics.length) {
    console.warn('No intrinsics loaded.');
    return;
  }

  // Dispose old decoration
  if (decorationType) {decorationType.dispose();}

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
  }
}
