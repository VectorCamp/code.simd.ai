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