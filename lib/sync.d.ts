import { SimpleGit } from 'simple-git';

export class GitError extends Error {
  constructor(message: string);
}

/**
 * Synchronizes the repository
 * @param verbose Enable verbose logging
 */
export function syncRepository(verbose?: boolean): Promise<void>;