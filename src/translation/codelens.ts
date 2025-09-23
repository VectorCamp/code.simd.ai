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

import { translationState, clearState } from './state';

export class TranslationCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(): vscode.CodeLens[] {
    if (!translationState.pendingRange || !translationState.pendingText) {return [];}

    const lensLine = translationState.pendingRange.start.line;
    const range = new vscode.Range(lensLine, 0, lensLine, 0);

    return [
      new vscode.CodeLens(range, {
        title: '✅ Accept Translation',
        command: 'code.simd.ai.acceptTranslation'
      }),
      new vscode.CodeLens(range, {
        title: '❌ Reject Translation',
        command: 'code.simd.ai.rejectTranslation'
      })
    ];
  }
}