import simpleGit from 'simple-git';
import inquirer from 'inquirer';
import { log } from './utils.js';

const git = simpleGit();

async function startRelease(version, verbose) {
  try {
    log.verbose(`Starting release: ${version}`, verbose);

    // Ensure we're on develop branch
    await git.checkout('develop');
    log.verbose('Switched to develop branch', verbose);

    // Pull latest changes
    await git.pull('origin', 'develop');
    log.verbose('Pulled latest changes from develop', verbose);

    // Create and checkout new release branch
    const branchName = `release/${version}`;
    await git.checkoutLocalBranch(branchName);
    
    log.success(`Successfully created release branch: ${branchName}`);
  } catch (error) {
    log.error(`Failed to start release: ${error.message}`);
    process.exit(1);
  }
}

async function finishRelease(version, verbose) {
  try {
    const branchName = `release/${version}`;
    log.verbose(`Finishing release: ${branchName}`, verbose);

    // Confirm with user
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to finish release '${version}'?`,
        default: false
      }
    ]);

    if (!confirm) {
      log.warning('Release finish cancelled');
      return;
    }

    // Ensure we're on the release branch
    await git.checkout(branchName);
    log.verbose(`Switched to ${branchName}`, verbose);

    // Merge into master
    await git.checkout('master');
    await git.merge([branchName]);
    log.verbose(`Merged ${branchName} into master`, verbose);

    // Create version tag
    await git.addTag(version);
    log.verbose(`Created tag: ${version}`, verbose);

    // Merge back into develop
    await git.checkout('develop');
    await git.merge([branchName]);
    log.verbose(`Merged ${branchName} into develop`, verbose);

    // Delete release branch
    await git.deleteLocalBranch(branchName);
    log.verbose(`Deleted local branch ${branchName}`, verbose);

    log.success(`Successfully finished release: ${version}`);
  } catch (error) {
    log.error(`Failed to finish release: ${error.message}`);
    process.exit(1);
  }
}

export { startRelease, finishRelease };