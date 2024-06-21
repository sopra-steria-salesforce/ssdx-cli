import { Command } from 'commander';
import * as print from '../../../../lib/print-helper.js';
import ora from 'ora';
import * as ssdx from '../../../../lib/ssdx-config.js';
import { runCmd } from '../../../../lib/command-helper.js';

export default class PermsetsCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('user:assign:permsets')
      .description('')
      .action(() => {
        void assign();
      });
  }
}

export async function assign() {
  print.subheader('Assigning Permission Sets');

  const ssdxConfig = ssdx.fetchConfig();
  for (const permset of ssdxConfig.permission_sets) {
    const spinner = ora(`Assigning ${permset}`).start();
    await runCmd('npx sf org:assign:permset', ['--name', permset]);
    spinner.succeed(`Assigned ${permset}`);
  }
}
