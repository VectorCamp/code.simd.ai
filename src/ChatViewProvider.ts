import * as vscode from 'vscode';
import * as path from 'path';
import { getApiToken } from './config';
import { getChatWebviewHtml } from './ChatWebviewHtml';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'code.simd.ai.chatView';
  private _view?: vscode.WebviewView;

  constructor(private readonly context: vscode.ExtensionContext) {}
  
  public postMessageToChat(text: string) {
    if (this._view) { 
      this._view.webview.postMessage({
        command: 'insertUserMessage',
        text: text
      });
    }
  }
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = this.getHtml();
    

    webviewView.webview.onDidReceiveMessage(async message => {
      if (message.type === 'send') {
      const userMsg = message.text;
      const history = this.context.workspaceState.get<string[]>('chatHistory') || [];
      const contextMessages = history
        .slice(-8)
        .map(line => {
          if (line.startsWith('SIMDAIuser: ')) {
            return { role: 'user', content: line.replace('SIMDAIuser: ', '') };
          } else if (line.startsWith('SIMDAIbot: ')) {
            return { role: 'assistant', content: line.replace('SIMDAIbot: ', '') };
          }
          return null;
        })
        .filter((msg): msg is { role: string; content: string } => msg !== null);

      contextMessages.push({ role: 'user', content: userMsg });

      const reply = await this.callSimdAiWithHistory(contextMessages);
      
      // Update history
      const oldHistory = this.context.workspaceState.get<string[]>('chatHistory') || [];
      const newHistory = [
        ...oldHistory,
        `SIMDAIuser: ${message.text}`,
        `SIMDAIbot: ${reply}`
      ];
      await this.context.workspaceState.update('chatHistory', newHistory);

      webviewView.webview.postMessage({ type: 'response', text: reply });
    } else if (message.type === 'requestHistory') {
      const history = this.context.workspaceState.get<string[]>('chatHistory') || [];
      webviewView.webview.postMessage({ type: 'history', messages: history });
    } else if (message.type === 'clearHistory') {
      await this.context.workspaceState.update('chatHistory', []);
      webviewView.webview.postMessage({ type: 'history', messages: [] });
    }
    });
  }

  // Mocked SIMD.ai response function — replace with real API call
  // private async callSimdAi(userPrompt: string): Promise<string> {
  //   try {
  //     const apiToken = getApiToken();
        // if (!apiToken) {
        //   return; // handle missing token
        // } // 🔒 Replace with env or secure config later
  //     const response = await fetch('https://simd.ai/api/chat/completions', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${apiToken}`
  //       },
  //       body: JSON.stringify({
  //         model: "SIMD-ai-2506.1.ai:24b",
  //         messages: [{ role: "user", content: userPrompt }]
  //       })
  //     });

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error('SIMD.ai API error:', errorText);
  //       return `⚠️ SIMD.ai error: ${response.statusText}`;
  //     }

  //     const data = await response.json();
  //     const output = data.choices?.[0]?.message?.content ?? '⚠️ No response content.';

  //     return output;

  //   } catch (err: any) {
  //     console.error('SIMD.ai fetch failed:', err);
  //     return `⚠️ SIMD.ai call failed: ${err.message}`;
  //   }
  // }

  private async callSimdAiWithHistory(messages: { role: string, content: string }[]): Promise<string> {
    try {
      const apiToken = getApiToken();
      if (!apiToken) {
        return 'Api token missing'; // handle missing token
      }
      const response = await fetch('https://simd.ai/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({
          model: "SIMD-ai-2506.1.ai:24b",
          messages: [
            ...messages
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SIMD.ai API error:', errorText);
        return `⚠️ SIMD.ai error: ${response.statusText}`;
      }

      const data = await response.json();
      const output = data.choices?.[0]?.message?.content ?? '⚠️ No response content.';

      return output;

    } catch (err: any) {
      console.error('SIMD.ai fetch failed:', err);
      return `⚠️ SIMD.ai call failed: ${err.message}`;
    }
  }
  private getHtml() {
    
    if (!this._view) {
      return; // or throw an error or return fallback HTML
    }
    const webview = this._view?.webview;
    return getChatWebviewHtml(this.context, webview);
  }

}
