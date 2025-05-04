import { program } from 'commander';
import { syncRepository, GitError } from '../../lib/sync';

program
  .command('sync')
  .description('Synchronize repository with remote')
  .action(async () => {
    try {
      await syncRepository();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Git Error:', error.message);
      } else {
        console.error('Git Error:', error);
      }
      process.exit(1);
    }
  });