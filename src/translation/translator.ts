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
import { translationState, clearState } from './state';
import { getApiToken } from '../config';

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatChoice {
  message?: ChatMessage;
}

interface ChatResponse {
  choices?: ChatChoice[];
}


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
    translationState.originalRange = selection;

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
          model: 'SIMD-ai-2506.1.ai:24b',
          messages: [{ role: "user", content: userPrompt }]
        })
      });
      
      if (!response.ok) {
        vscode.window.showErrorMessage(`API error: ${response.statusText}`);
        return;
      }

      const data = (await response.json()) as ChatResponse;

      const translated = data.choices?.[0]?.message?.content ?? '// No translation received';

      translationState.pendingText = translated;
      const cleanTranslation = translated.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
      const formattedBlock = `\n${cleanTranslation}\n`;

      const insertPosition = new vscode.Position(selection.end.line + 1, 0);
      await editor.edit(editBuilder => {
        editBuilder.insert(insertPosition, formattedBlock);
      });

      const translatedStart = insertPosition;
      const lines = formattedBlock.split("\n");
      const translatedEnd = new vscode.Position(
          insertPosition.line + lines.length - 1,
          lines[lines.length - 1].length
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