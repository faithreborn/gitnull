import { program } from 'commander';
import { createFeature, checkoutFeature, finishFeature, GitError } from '../../lib/feature';

program
  .command('feature')
  .description('Manage feature branches')
  .option('create <name>', 'Create a new feature branch')
  .option('checkout <name>', 'Checkout an existing feature branch')
  .option('finish <name>', 'Finish a feature branch')
  .action(async (options) => {
    try {
      if (options.create) {
        await createFeature(options.create);
      } else if (options.checkout) {
        await checkoutFeature(options.checkout);
      } else if (options.finish) {
        await finishFeature(options.finish);
      } else {
        program.help();
      }
    } catch (error) {
      if (error instanceof GitError) {
        console.error('Git Error:', error.message);
      } else {
        console.error('Unexpected error:', error instanceof Error ? error.message : String(error));
      }
      process.exit(1);
    }
  });