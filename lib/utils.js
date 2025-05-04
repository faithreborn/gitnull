import chalk from 'chalk';
import figlet from 'figlet';

const displayBanner = () => {
  console.log(
    chalk.blue(
      figlet.textSync('gitNull', { font: 'Standard', horizontalLayout: 'full' })
    )
  );
};

const log = {
  info: (message) => console.log(chalk.blue('ℹ'), message),
  success: (message) => console.log(chalk.green('✔'), message),
  warning: (message) => console.log(chalk.yellow('⚠'), message),
  error: (message) => console.log(chalk.red('✖'), message),
  verbose: (message, isVerbose) => {
    if (isVerbose) {
      console.log(chalk.gray('→'), message);
    }
  }
};

export { displayBanner, log };