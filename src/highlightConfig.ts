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

export const HighlightConfig: Record<
  string,
  { gradient: string; flat: string }
> = {
  NEON: {
    gradient: 'linear-gradient(90deg, #00FF7F, #32CD32, #228B22)',
    flat: '#32CD32',
  },
  INTEL: {
    gradient: 'linear-gradient(90deg, #00BFFF, #1E90FF, #4169E1)',
    flat: '#1E90FF',
  },
  POWER: {
    gradient: 'linear-gradient(90deg, #7B68EE, #6A5ACD, #483D8B)',
    flat: '#6A5ACD',
  },
  DEFAULT: {
    gradient: 'linear-gradient(90deg, #ADFF2F, #7FFF00, #32CD32)',
    flat: '#7FFF00',
  },
};