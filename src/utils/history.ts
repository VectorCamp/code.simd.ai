import * as vscode from 'vscode';

// const KEY = 'chatHistory';

// export function getChatHistory(context: vscode.ExtensionContext): string[] {
//   return context.workspaceState.get<string[]>(KEY) || [];
// }

// export async function saveChatHistory(context: vscode.ExtensionContext, userText: string, botReply: string) {
//   const history = getChatHistory(context);
//   const newHistory = [...history, `SIMDAIuser: ${userText}`, `SIMDAIbot: ${botReply}`];
//   await context.workspaceState.update(KEY, newHistory);
// }

// export async function clearChatHistory(context: vscode.ExtensionContext) {
//   await context.workspaceState.update(KEY, []);
// }

const SESSION_KEY = 'chatSessions';

export function getAllSessions(context: vscode.ExtensionContext): Record<string, string[]> {
  return context.workspaceState.get<Record<string, string[]>>(SESSION_KEY) || {};
}

export function getChatHistory(context: vscode.ExtensionContext, sessionId: string): string[] {
  const sessions = getAllSessions(context);
  return sessions[sessionId] || [];
}

export async function saveChatHistory(context: vscode.ExtensionContext, sessionId: string, userText: string, botReply: string) {
  const sessions = getAllSessions(context);
  const history = sessions[sessionId] || [];
  sessions[sessionId] = [...history, `SIMDAIuser: ${userText}`, `SIMDAIbot: ${botReply}`];
  await context.workspaceState.update(SESSION_KEY, sessions);
}

export async function clearChatHistory(context: vscode.ExtensionContext, sessionId: string) {
  const sessions = getAllSessions(context);
  delete sessions[sessionId];
  await context.workspaceState.update(SESSION_KEY, sessions);
}
