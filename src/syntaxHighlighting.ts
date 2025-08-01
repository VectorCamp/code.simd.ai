import * as vscode from 'vscode';
import * as fs from 'fs';

let decorationType: vscode.TextEditorDecorationType | null = null;
let intrinsics: string[] = [];

export function initIntrinsicHighlighting(context: vscode.ExtensionContext) {
  try {
    const intrinsicsPath = vscode.Uri.joinPath(context.extensionUri, 'resources', 'intrinsics.txt').fsPath;
    const content = fs.readFileSync(intrinsicsPath, 'utf8');
    intrinsics = content.split(/\r?\n/).filter(Boolean);
  } catch (error) {
    console.error('Failed to load intrinsics:', error);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) highlightIntrinsics(editor);
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

function highlightIntrinsics(editor: vscode.TextEditor) {
  if (!intrinsics.length) {
    console.warn('No intrinsics loaded.');
    return;
  }

  // Dispose old
  if (decorationType) {
    decorationType.dispose();
  }

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
  while ((match = regex.exec(text)) !== null) {
    const startPos = editor.document.positionAt(match.index);
    const endPos = editor.document.positionAt(match.index + match[0].length);
    decorations.push({ range: new vscode.Range(startPos, endPos) });
  }

  editor.setDecorations(decorationType, decorations);
}

export function deactivateHighlighting() {
  if (decorationType) {
    decorationType.dispose();
  }
}
