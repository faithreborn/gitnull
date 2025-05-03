import simpleGit from 'simple-git';
import inquirer from 'inquirer';
import { log } from './utils.js';

const git = simpleGit();

async function startFeature(name, verbose) {
  try {
    log.verbose(`Starting feature branch: ${name}`, verbose);

    // Ensure we're on develop branch
    await git.checkout('develop');
    log.verbose('Switched to develop branch', verbose);

    // Pull latest changes
    await git.pull('origin', 'develop');
    log.verbose('Pulled latest changes from develop', verbose);

    // Create and checkout new feature branch
    const branchName = `feature/${name}`;
    await git.checkoutLocalBranch(branchName);
    
    log.success(`Successfully created feature branch: ${branchName}`);
  } catch (error) {
    log.error(`Failed to start feature: ${error.message}`);
    process.exit(1);
  }
}

async function finishFeature(name, verbose) {
  try {
    const branchName = `feature/${name}`;
    log.verbose(`Finishing feature branch: ${branchName}`, verbose);

    // Confirm with user
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to finish feature '${name}'?`,
        default: false
      }
    ]);

    if (!confirm) {
      log.warning('Feature finish cancelled');
      return;
    }

    // Ensure we're on the feature branch
    await git.checkout(branchName);
    log.verbose(`Switched to ${branchName}`, verbose);

    // Get develop branch up to date
    await git.checkout('develop');
    await git.pull('origin', 'develop');
    log.verbose('Updated develop branch', verbose);

    // Merge feature branch into develop
    await git.checkout('develop');
    await git.merge([branchName]);
    log.verbose(`Merged ${branchName} into develop`, verbose);

    // Delete feature branch
    await git.deleteLocalBranch(branchName);
    log.verbose(`Deleted local branch ${branchName}`, verbose);

    log.success(`Successfully finished feature: ${name}`);
  } catch (error) {
    log.error(`Failed to finish feature: ${error.message}`);
    process.exit(1);
  }
}

export { startFeature, finishFeature };