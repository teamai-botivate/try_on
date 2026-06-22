import type { FilesetResolver as FilesetResolverType } from '@mediapipe/tasks-vision';

let filesetResolverInstance: FilesetResolverType | null = null;

export async function getFilesetResolver(): Promise<FilesetResolverType> {
  if (filesetResolverInstance) {
    return filesetResolverInstance;
  }

  const { FilesetResolver } = await import('@mediapipe/tasks-vision');

  filesetResolverInstance = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
  );

  return filesetResolverInstance;
}

export function resetFilesetResolver(): void {
  filesetResolverInstance = null;
}
