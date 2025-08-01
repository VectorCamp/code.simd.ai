import * as vscode from 'vscode';

const KEY = 'chatHistory';

export function getChatHistory(context: vscode.ExtensionContext): string[] {
  return context.workspaceState.get<string[]>(KEY) || [];
}

export async function saveChatHistory(context: vscode.ExtensionContext, userText: string, botReply: string) {
  const history = getChatHistory(context);
  const newHistory = [...history, `SIMDAIuser: ${userText}`, `SIMDAIbot: ${botReply}`];
  await context.workspaceState.update(KEY, newHistory);
}

export async function clearChatHistory(context: vscode.ExtensionContext) {
  await context.workspaceState.update(KEY, []);
}
