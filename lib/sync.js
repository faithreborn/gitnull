import simpleGit from 'simple-git';
import inquirer from 'inquirer';
import { log } from './utils.js';
import fs from 'fs';
import path from 'path';

const git = simpleGit();

async function ensureGitRepo() {
  try {
    await git.status();
    return true;
  } catch (error) {
    const { initRepo } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'initRepo',
        message: 'Current directory is not a Git repository. Would you like to initialize one?',
        default: true
      }
    ]);

    if (initRepo) {
      await git.init();
      log.success('Initialized new Git repository');
      
      // Create initial commit if needed
      const status = await git.status();
      if (status.files.length > 0) {
        await git.add('.');
        await git.commit('Initial commit');
        log.success('Created initial commit');
      }

      // Setup main branch
      await git.checkoutLocalBranch('main');
      log.success('Created and switched to main branch');
      
      return true;
    }
    return false;
  }
}

async function promptForCredentials() {
  const { username, token } = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Enter your Git username:',
      validate: input => input.length > 0 || 'Username is required'
    },
    {
      type: 'password',
      name: 'token',
      message: 'Enter your personal access token:',
      validate: input => input.length > 0 || 'Personal access token is required'
    }
  ]);
  return { username, token };
}

async function ensureRemoteSetup(currentBranch) {
  try {
    const remotes = await git.getRemotes();
    if (remotes.length === 0) {
      const { remoteUrl } = await inquirer.prompt([
        {
          type: 'input',
          name: 'remoteUrl',
          message: 'No remote repository found. Please enter the remote repository URL:',
          validate: input => input.length > 0 || 'Remote URL is required'
        }
      ]);

      await git.addRemote('origin', remoteUrl);
      log.success('Added remote repository');
    }

    let maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        await git.push(['--set-upstream', 'origin', currentBranch]);
        log.success(`Set upstream branch to origin/${currentBranch}`);
        return;
      } catch (pushError) {
        if (pushError.message.includes('no upstream branch')) {
          await git.push(['--set-upstream', 'origin', currentBranch]);
          log.success(`Set upstream branch to origin/${currentBranch}`);
          return;
        } else if (pushError.message.includes('403') || pushError.message.includes('denied')) {
          log.warning('Authentication failed.');
          
          const { action } = await inquirer.prompt([
            {
              type: 'list',
              name: 'action',
              message: 'How would you like to proceed?',
              choices: [
                { name: 'Enter credentials', value: 'credentials' },
                { name: 'Try different remote URL', value: 'url' },
                { name: 'Cancel', value: 'cancel' }
              ]
            }
          ]);

          if (action === 'credentials') {
            const { username, token } = await promptForCredentials();
            const remote = await git.getRemotes(true);
            const remoteUrl = remote[0].refs.fetch;
            const urlWithAuth = remoteUrl.replace('https://', `https://${username}:${token}@`);
            
            await git.removeRemote('origin');
            await git.addRemote('origin', urlWithAuth);
            log.success('Updated credentials');
            retryCount++;
            continue;
          } else if (action === 'url') {
            const { remoteUrl } = await inquirer.prompt([
              {
                type: 'input',
                name: 'remoteUrl',
                message: 'Enter new remote repository URL:',
                validate: input => input.length > 0 || 'Remote URL is required'
              }
            ]);

            await git.removeRemote('origin');
            await git.addRemote('origin', remoteUrl);
            log.success('Updated remote repository URL');
            retryCount++;
            continue;
          } else {
            throw new Error('Authentication failed. Please configure your Git credentials and try again.');
          }
        } else {
          throw pushError;
        }
      }
    }
    throw new Error('Maximum retry attempts reached. Please verify your Git configuration and try again.');
  } catch (error) {
    throw new Error(`Failed to setup remote: ${error.message}`);
  }
}

async function push(verbose) {
  try {
    // Check if Git repo exists and initialize if needed
    if (!(await ensureGitRepo())) {
      log.warning('Operation cancelled - no Git repository');
      return;
    }
    log.verbose('Pushing changes to remote repository', verbose);

    // Get current branch and validate
    const branchSummary = await git.branch();
    let currentBranch = branchSummary.current;
    
    if (!currentBranch) {
      // If no branch exists, create and checkout main branch
      await git.checkoutLocalBranch('main');
      log.success('Created and switched to main branch');
      currentBranch = 'main';
    }
    
    // Check for uncommitted changes
    const status = await git.status();
    if (status.files.length > 0) {
      const { stageChanges } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'stageChanges',
          message: 'There are unstaged changes. Would you like to stage and commit them?',
          default: true
        }
      ]);

      if (stageChanges) {
        await git.add('.');
        const { commitMessage } = await inquirer.prompt([
          {
            type: 'input',
            name: 'commitMessage',
            message: 'Enter commit message:',
            default: 'Update changes',
            validate: input => input.length > 0 || 'Commit message is required'
          }
        ]);
        await git.commit(commitMessage);
        log.success('Changes committed successfully');
      } else {
        log.warning('Push cancelled - uncommitted changes');
        return;
      }
    }
    
    log.verbose(`Current branch: ${currentBranch}`, verbose);

    // Confirm with user
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Push changes from '${currentBranch}' to remote?`,
        default: false
      }
    ]);

    if (!confirm) {
      log.warning('Push cancelled');
      return;
    }

    // Ensure remote is set up and push changes
    await ensureRemoteSetup(currentBranch);
    log.success(`Successfully pushed changes to ${currentBranch}`);
  } catch (error) {
    log.error(`Failed to push changes: ${error.message}`);
    process.exit(1);
  }
}

async function sync(verbose) {
  try {
    // Check if Git repo exists and initialize if needed
    if (!(await ensureGitRepo())) {
      log.warning('Operation cancelled - no Git repository');
      return;
    }
    log.verbose('Syncing with remote repository', verbose);

    // Get current branch
    const branchSummary = await git.branch();
    const currentBranch = branchSummary.current;
    log.verbose(`Current branch: ${currentBranch}`, verbose);

    // Confirm with user
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Sync (pull & push) '${currentBranch}' with remote?`,
        default: false
      }
    ]);

    if (!confirm) {
      log.warning('Sync cancelled');
      return;
    }

    // Pull latest changes
    await git.pull('origin', currentBranch);
    log.verbose(`Pulled latest changes from ${currentBranch}`, verbose);

    // Ensure remote is set up and push local changes
    await ensureRemoteSetup(currentBranch);
    log.verbose(`Pushed local changes to ${currentBranch}`, verbose);

    log.success(`Successfully synced with remote repository`);
  } catch (error) {
    log.error(`Failed to sync: ${error.message}`);
    process.exit(1);
  }
}

export { push, sync };