import * as vscode from 'vscode';

import { translationState, clearState } from './state';

export class TranslationCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(): vscode.CodeLens[] {
    if (!translationState.pendingRange || !translationState.pendingText) return [];

    const lensLine = translationState.pendingRange.start.line;
    const range = new vscode.Range(lensLine, 0, lensLine, 0);

    return [
      new vscode.CodeLens(range, {
        title: '✅ Accept Translation',
        command: 'code.simd.ai.acceptTranslation'
      }),
      new vscode.CodeLens(range, {
        title: '❌ Reject Translation',
        command: 'code.simd.ai.rejectTranslation'
      })
    ];
  }
}