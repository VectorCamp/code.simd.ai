import * as vscode from 'vscode';

import { translationState, clearState } from './state';
import { ChatViewProvider } from '../ChatViewProvider';

export function registerAcceptRejectCommands(context: vscode.ExtensionContext) {

        const acceptCmd = vscode.commands.registerCommand('code.simd.ai.acceptTranslation', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || !translationState.pendingRange || !translationState.pendingText || !translationState.originalText) return;
    
            const startLine = Math.max(0, translationState.pendingRange.start.line - translationState.originalText.split('\n').length - 2);
            const fullRange = new vscode.Range(
                new vscode.Position(startLine, 0),
                translationState.pendingRange.end
            );
    
    
            await editor.edit(editBuilder => {
                editBuilder.replace(fullRange, translationState.pendingText!);
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
            if (!editor || !translationState.pendingRange) return;
    
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
		if (!editor) return;

		const selection = editor.document.getText(editor.selection);
		provider.postMessageToChat(selection); // Send selected SIMD code to the chat webview

		vscode.window.showInformationMessage(`Editing SIMD code sent to chat.`);
	});

	context.subscriptions.push(editCmd);
}