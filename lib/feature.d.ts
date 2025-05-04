import { SimpleGit } from 'simple-git';

export class GitError extends Error {
  constructor(message: string);
}

/**
 * Creates and checks out a new feature branch from develop
 * @param name The name of the feature
 * @param verbose Enable verbose logging
 */
export function createFeature(name: string, verbose?: boolean): Promise<void>;

/**
 * Checks out an existing feature branch
 * @param name The name of the feature branch to checkout
 * @param verbose Enable verbose logging
 */
export function checkoutFeature(name: string, verbose?: boolean): Promise<void>;

/**
 * Finishes a feature branch by merging it into develop and deleting the feature branch
 * @param name The name of the feature to finish
 * @param verbose Enable verbose logging
 */
export function finishFeature(name: string, verbose?: boolean): Promise<void>;