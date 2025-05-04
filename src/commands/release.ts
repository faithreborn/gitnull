import { program } from 'commander';
import { createRelease, finishRelease, GitError } from '../../lib/release';

program
  .command('release')
  .description('Manage release branches')
  .option('create <version>', 'Create a new release branch')
  .option('finish <version>', 'Finish a release branch')
  .action(async (options) => {
    try {
      if (options.create) {
        await createRelease(options.create);
      } else if (options.finish) {
        await finishRelease(options.finish);
      } else {
        program.help();
      }
    } catch (error: unknown) {
      if (error instanceof GitError) {
        console.error('Git Error:', error.message);
      } else {
        console.error('Unexpected error:', error instanceof Error ? error.message : String(error));
      }
      process.exit(1);
    }
  });