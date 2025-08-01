import * as vscode from 'vscode';
import { getChatWebviewHtml } from './ChatWebviewHtml';
import { getChatHistory, saveChatHistory, clearChatHistory } from './utils/history';
import { extractMessages } from './utils/messageParser';
import { callSimdAiWithHistory } from './api/simdAi';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'code_simd_ai_chatView';
  private _view?: vscode.WebviewView;

  constructor(private readonly context: vscode.ExtensionContext) {}

  public postMessageToChat(text: string) {
    this._view?.webview.postMessage({ command: 'insertUserMessage', text });
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    const webview = webviewView.webview;
    webview.options = { enableScripts: true };
    webview.html = getChatWebviewHtml(this.context, webview);

    webview.onDidReceiveMessage(async message => {
      switch (message.type) {
        case 'send':
          await this.handleUserMessage(message.text);
          break;
        case 'requestHistory':
          webview.postMessage({ type: 'history', messages: getChatHistory(this.context) });
          break;
        case 'clearHistory':
          await clearChatHistory(this.context);
          webview.postMessage({ type: 'history', messages: [] });
          break;
      }
    });
  }

  private async handleUserMessage(userText: string) {
    const webview = this._view?.webview;
    if (!webview) return;

    const rawHistory = getChatHistory(this.context);
    const contextMessages = extractMessages(rawHistory);
    contextMessages.push({ role: 'user', content: userText });

    const reply = await callSimdAiWithHistory(contextMessages);
    await saveChatHistory(this.context, userText, reply);

    webview.postMessage({ type: 'response', text: reply });
  }
}
