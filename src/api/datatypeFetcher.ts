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

import fetch from 'node-fetch';

/**
 * Fetch datatypes grouped by architecture.
 *
 * Example response:
 * {
 *   "NEON": ["uint16x8_t", "float32x8_t"],
 *   "INTEL": ["__m128h", "__m256h"],
 *   "POWER": ["vector signed char", "vector bool char"]
 * }
 */

import { API_BASE, getApiToken } from '../config';
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import * as vscode from 'vscode';

export async function fetchDatatypesByArch(): Promise<Record<string, string[]>> {
  const apiKey = getApiToken();
  if (!apiKey) {
    vscode.window.showInformationMessage("⚠️ Please get your API token from https://simd.ai");
    console.warn('⚠️ API key missing');
    return {};
  }

  const endpoint = `${API_BASE}/v1/plugin-datatypes/get-datatypes-list`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ api_key: apiKey })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (!data || typeof data !== 'object' || !data.datatypes_list) {
      throw new Error('Invalid JSON structure');
    }

    // console.log('✅ Datatypes fetched successfully');
    return data.datatypes_list as Record<string, string[]>; 

  } catch (err) {
    console.error('❌ Failed to fetch datatypes:', err);
    return {};
  }
}