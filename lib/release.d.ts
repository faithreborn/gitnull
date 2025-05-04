import { SimpleGit } from 'simple-git';

export class GitError extends Error {
  constructor(message: string);
}

/**
 * Creates and checks out a new release branch from develop
 * @param version The version number for the release
 * @param verbose Enable verbose logging
 */
export function createRelease(version: string, verbose?: boolean): Promise<void>;

/**
 * Finishes a release branch by merging it into main and develop
 * @param version The version number of the release to finish
 * @param verbose Enable verbose logging
 */
export function finishRelease(version: string, verbose?: boolean): Promise<void>;