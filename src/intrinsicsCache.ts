import { fetchIntrinsicNames } from './api/simdAi';

let intrinsics: string[] | null = null;

export async function getIntrinsics(): Promise<string[]> {
  if (!intrinsics) {
    try {
      intrinsics = await fetchIntrinsicNames();
    } catch (err) {
      console.error("Failed to fetch intrinsics:", err);
      intrinsics = [];
    }
  }
  return intrinsics;
}