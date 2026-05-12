import type { StorageBackend } from './types';

let _backend: StorageBackend | null = null;

export async function getStorageBackend(): Promise<StorageBackend> {
  if (_backend) return _backend;

  const useGitHub =
    process.env.GITHUB_TOKEN &&
    (process.env.VERCEL === '1' || process.env.STORAGE_BACKEND === 'github');

  if (useGitHub) {
    const { GitHubStorageBackend } = await import('./github-backend');
    _backend = new GitHubStorageBackend(
      process.env.GITHUB_TOKEN!,
      process.env.GITHUB_REPO ?? 'Jiayoujw/digital-garden',
      process.env.GITHUB_BRANCH ?? 'main'
    );
  } else {
    const { FsStorageBackend } = await import('./fs-backend');
    _backend = new FsStorageBackend();
  }

  return _backend;
}

export function resetStorageBackend(): void {
  _backend = null;
}
