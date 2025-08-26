import * as vscode from 'vscode';

export function getApiToken(): string | undefined {
  const config = vscode.workspace.getConfiguration('code.simd.ai');
  const token = config.get<string>('apiToken');
  if (!token) {
    vscode.window.showErrorMessage('API token missing. Please set "code.simd.ai.apiToken" in your settings.');
  }
  return token;
}

import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const PLUGIN_DEFAULT_TOKEN = "sk-e1af5d37498c4fa0823fabda7c5c8c31";