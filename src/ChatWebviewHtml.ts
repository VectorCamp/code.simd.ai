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
import * as path from 'path';
import * as fs from 'fs';

export function getChatWebviewHtml(context: vscode.ExtensionContext, webview: vscode.Webview): string {
  const htmlPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'chat.html');
  let html = fs.readFileSync(htmlPath.fsPath, 'utf8');

  const botLogoUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'media', 'BotLogo.svg')
  );

  const markedUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'media', 'marked.js')
  );

  // Replace placeholder tokens in HTML with actual webview URIs
  html = html
    .replace(/\${botLogoUri}/g, botLogoUri.toString())
    .replace(/\${markedUri}/g, markedUri.toString());

  return html;
}