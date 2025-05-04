#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { startFeature, finishFeature } from '../lib/feature.js';
import { startRelease, finishRelease } from '../lib/release.js';
import { push, sync } from '../lib/sync.js';
import { displayBanner } from '../lib/utils.js';

// Display banner
displayBanner();

// Configure CLI
program
  .version('1.0.0')
  .option('-v, --verbose', 'output extra debugging');

// Feature commands
program
  .command('start-feature <name>')
  .description('Start a new feature branch')
  .action(async (name) => {
    await startFeature(name, program.opts().verbose);
  });

program
  .command('finish-feature <name>')
  .description('Finish a feature branch')
  .action(async (name) => {
    await finishFeature(name, program.opts().verbose);
  });

// Release commands
program
  .command('start-release <version>')
  .description('Start a new release')
  .action(async (version) => {
    await startRelease(version, program.opts().verbose);
  });

program
  .command('finish-release <version>')
  .description('Finish a release')
  .action(async (version) => {
    await finishRelease(version, program.opts().verbose);
  });

// Sync commands
program
  .command('push')
  .description('Push changes to remote repository')
  .action(async () => {
    await push(program.opts().verbose);
  });

program
  .command('sync')
  .description('Sync with remote repository')
  .action(async () => {
    await sync(program.opts().verbose);
  });

program.parse(process.argv);