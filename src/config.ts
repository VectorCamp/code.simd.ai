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

export const API_KEY_VIEW_C_INTRINSIC = process.env.API_KEY_VIEW_C_INTRINSIC || '';
export const API_KEY_INTRINSIC_NAMES = process.env.API_KEY_INTRINSIC_NAMES || '';