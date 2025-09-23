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
import { ChatViewProvider } from '../ChatViewProvider';

export function registerAcceptRejectCommands(context: vscode.ExtensionContext) {

        const acceptCmd = vscode.commands.registerCommand('code.simd.ai.acceptTranslation', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || !translationState.pendingRange || !translationState.originalRange || !translationState.pendingText || !translationState.originalText) {return;}
    
            const startLine = Math.max(0, translationState.pendingRange.start.line - translationState.originalText.split('\n').length - 2);
            const fullRange = new vscode.Range(
                new vscode.Position(startLine, 0),
                translationState.pendingRange.end
            );
    
    
            await editor.edit(editBuilder => {
                editBuilder.replace(translationState.originalRange!, translationState.pendingText!);

                // Remove the preview block that was inserted below
                editBuilder.delete(translationState.pendingRange!);
            });
    
            if (translationState.pendingDecoration) {
                translationState.pendingDecoration.dispose();
                translationState.pendingDecoration = null;
            }
    
            clearState();
            vscode.window.showInformationMessage('Translation accepted.');
        });
    
        const rejectCmd = vscode.commands.registerCommand('code.simd.ai.rejectTranslation', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || !translationState.pendingRange) {return;}
    
            await editor.edit(editBuilder => {
                editBuilder.delete(translationState.pendingRange!);
            });
    
            if (translationState.pendingDecoration) {
                translationState.pendingDecoration.dispose();
                translationState.pendingDecoration = null;
            }
    
            clearState();
            vscode.window.showInformationMessage('Translation rejected.');
        });
        context.subscriptions.push(acceptCmd, rejectCmd);
}


export function registerEditSIMDCommand(context: vscode.ExtensionContext, provider: ChatViewProvider) {
	const editCmd = vscode.commands.registerCommand('code.simd.ai.editSIMD', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {return;}

		const selection = editor.document.getText(editor.selection);
		provider.postMessageToChat(selection); // Send selected SIMD code to the chat webview

		vscode.window.showInformationMessage(`Editing SIMD code sent to chat.`);
	});

	context.subscriptions.push(editCmd);
}