#!/usr/bin/env node

import { program } from 'commander';
import { version } from '../package.json';

// Import commands
import './commands/feature';
import './commands/release';
import './commands/sync';

program
  .version(version)
  .description('Professional Git Flow CLI tool for streamlined workflow management')
  .parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}