import * as vscode from 'vscode';
import { translationState, clearState } from './state';
import { getApiToken } from '../config';




export function registerTranslateCommand(fromArch: string, toArch: string, commandName: string) {
  return vscode.commands.registerCommand(commandName, async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found.');
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showInformationMessage(`Please select ${fromArch} code to translate.`);
      return;
    }

    const selectedText = editor.document.getText(selection);
    translationState.originalText = selectedText;

    const userPrompt = `I have a function written using ${fromArch} intrinsics and I want to translate it to ${toArch}. Can you help?
If there is no direct equivalent intrinsic in the target architecture, try to replicate the behavior using multiple intrinsics instead of just one.
Please provide the code as text, don't enclose it in \`\`\` code \`\`\`\n\n${selectedText}`;

    vscode.window.showInformationMessage(`Translating ${fromArch} to ${toArch}...`);

    try {
      const apiToken = getApiToken();
      if (!apiToken) {
        return; // handle missing token
      }

      const response = await fetch('https://simd.ai/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({
          model: "SIMD-ai-2506.1.ai:24b",
          messages: [{ role: "user", content: userPrompt }]
        })
      });
      
      if (!response.ok) {
        vscode.window.showErrorMessage(`API error: ${response.statusText}`);
        return;
      }

      const data = await response.json();
      const translated = data.choices?.[0]?.message?.content ?? '// No translation received';

      translationState.pendingText = translated;
      const cleanTranslation = translated.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
      const formattedBlock = `\n// Original ${fromArch}:\n${translationState.originalText}\n\n// Translated ${toArch}:\n${cleanTranslation}\n`;

      const insertPosition = new vscode.Position(selection.end.line + 1, 0);
      await editor.edit(editBuilder => {
        editBuilder.insert(insertPosition, formattedBlock);
      });

      const translatedStart = insertPosition;
      const translatedEnd = new vscode.Position(
        insertPosition.line + formattedBlock.split('\n').length,
        0
      );
      translationState.pendingRange = new vscode.Range(translatedStart, translatedEnd);

      translationState.pendingDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(0,255,0,0.1)'
      });
      editor.setDecorations(translationState.pendingDecoration, [translationState.pendingRange]);

      vscode.commands.executeCommand('editor.action.codeLensRefresh');

    } catch (error: any) {
      vscode.window.showErrorMessage('Failed to translate: ' + error.message);
    }
  });
}