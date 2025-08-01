import * as vscode from 'vscode';

export function getApiToken(): string | undefined {
  const config = vscode.workspace.getConfiguration('code.simd.ai');
  const token = config.get<string>('apiToken');
  if (!token) {
    vscode.window.showErrorMessage('API token missing. Please set "code.simd.ai.apiToken" in your settings.');
  }
  return token;
}
