import type { FilesetResolver as FilesetResolverType } from '@mediapipe/tasks-vision';

let filesetResolverInstance: FilesetResolverType | null = null;

export const MEDIAPIPE_TASKS_VERSION = '0.10.35';

export async function getFilesetResolver(): Promise<FilesetResolverType> {
  if (filesetResolverInstance) {
    return filesetResolverInstance;
  }

  const { FilesetResolver } = await import('@mediapipe/tasks-vision');

  filesetResolverInstance = await FilesetResolver.forVisionTasks(
    `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_TASKS_VERSION}/wasm`
  );

  return filesetResolverInstance;
}

export function resetFilesetResolver(): void {
  filesetResolverInstance = null;
}
