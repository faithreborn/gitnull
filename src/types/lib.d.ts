declare module '../../lib/feature' {
  export class GitError extends Error {
    constructor(message: string);
  }

  export function createFeature(name: string): Promise<void>;
  export function checkoutFeature(name: string): Promise<void>;
  export function finishFeature(name: string): Promise<void>;
}

declare module '../../lib/release' {
  export class GitError extends Error {
    constructor(message: string);
  }

  export function createRelease(version: string): Promise<void>;
  export function finishRelease(version: string): Promise<void>;
}

declare module '../../lib/sync' {
  export class GitError extends Error {
    constructor(message: string);
  }

  export function syncRepository(): Promise<void>;
}