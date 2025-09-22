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
