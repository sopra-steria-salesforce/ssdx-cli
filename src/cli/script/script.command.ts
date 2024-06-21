import ora from 'ora';
import { runCmd } from '../../lib/command-helper.js';
import * as print from '../../lib/print-helper.js';
import { Command } from 'commander';

export default class AssignCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('script')
      .description('Run the scripts defined in ./ssdx.config.json');

    this.program
      .command('script:apex')
      .description('Run the Apex scripts defined in ./ssdx.config.json');

    this.program
      .command('script:js')
      .description('Run the JavaScript files defined in ./ssdx.config.json');
  }
}

export async function runApex(file: string) {
  print.subheader('Running Apex Script');
  const spinner = ora(`Running ${file}`).start();
  await runCmd('npx sf org:run:apex', ['--file', file]);
  spinner.succeed(`Ran ${file}`);
}

export async function runJs(file: string) {
  print.subheader('Running JS Script');
  const spinner = ora(`Running ${file}`).start();
  await runCmd('npx sf org:run:js', ['--file', file]);
  spinner.succeed(`Ran ${file}`);
}
