import { Command } from 'commander';
import * as print from '../../../../lib/print-helper.js';
import ora from 'ora';
import * as ssdx from '../../../../lib/ssdx-config.js';
import { runCmd } from '../../../../lib/command-helper.js';

export default class LicenseCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('user:assign:license')
      .description('')
      .action(() => {
        void assign();
      });
  }
}

export async function assign() {
  print.subheader('Assigning Permission Set Licenses');

  const ssdxConfig = ssdx.fetchConfig();
  for (const license of ssdxConfig.permission_set_licenses) {
    const spinner = ora(`Assigning ${license}`).start();
    await runCmd('npx sf org:assign:permsetlicense', ['--name', license]);
    spinner.succeed(`Assigned ${license}`);
  }
}
