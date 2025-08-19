import * as vscode from 'vscode';

export const translationState = {
  pendingDecoration: null as vscode.TextEditorDecorationType | null,
  pendingRange: null as vscode.Range | null,
  pendingText: null as string | null,
  originalText: null as string | null,
  originalRange: null as vscode.Range | null,
};

export function clearState() {
  translationState.pendingRange = null;
  translationState.pendingText = null;
  translationState.originalText = null;
  translationState.originalRange = null;
}