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

export const PLUGIN_DEFAULT_TOKEN = "sk-b5204816b07e49ec8096c9e8b34f28bb";