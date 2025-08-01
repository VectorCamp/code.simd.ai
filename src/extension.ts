import * as vscode from 'vscode';
import { ChatViewProvider } from './ChatViewProvider';
import * as fs from 'fs';
import * as path from 'path';


import { translationState, clearState } from './translation/state';
import { registerTranslateCommand } from './translation/translator';
import { registerAcceptRejectCommands, registerEditSIMDCommand } from './translation/commands';
import { TranslationCodeLensProvider } from './translation/codelens';
import { initIntrinsicHighlighting, deactivateHighlighting } from './syntaxHighlighting';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "code.simd.ai" is now active!');
	const provider = new ChatViewProvider(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('code.simd.ai.chatView', provider)
	);

	registerEditSIMDCommand(context, provider);
	registerAcceptRejectCommands(context);
	context.subscriptions.push(
		registerTranslateCommand('SSE4.2', 'NEON', 'code.simd.ai.translateSSEToNeon'),
		registerTranslateCommand('NEON', 'SSE4.2', 'code.simd.ai.translateNeonToSSE'),
		registerTranslateCommand('SSE4.2', 'VSX', 'code.simd.ai.translateSSEToVSX'),
		registerTranslateCommand('VSX', 'SSE4.2', 'code.simd.ai.translateVSXToSSE'),
		registerTranslateCommand('NEON', 'VSX', 'code.simd.ai.translateNeonToVSX'),
		registerTranslateCommand('VSX', 'NEON', 'code.simd.ai.translateVSXToNeon')
	);
	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider({ scheme: 'file', language: '*' }, new TranslationCodeLensProvider())
	);

	initIntrinsicHighlighting(context);
}

export function deactivate() {
	deactivateHighlighting();	
}
