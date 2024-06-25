import { Command } from 'commander';
import ora from 'ora';
import * as ssdx from '../../../../lib/config/ssdx-config.js';
import { runCmd } from '../../../../lib/command-helper.js';
import * as slot from '../../../../lib/config/slot-helper.js';
import SlotOption from '../../../../dto/ssdx-config-slot.dto.js';

export default class LicenseCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('user:assign:license')
      .description('Assign Permission Set Licenses defined in ssdx-config.json')
      .option('--init', 'Assigns before dependencies', false)
      .option('--pre_deploy', 'Assigns before deploy', false)
      .option('--post_deploy', 'Assigns after deploy', false)
      .action((options: SlotOption) => {
        void assign(options);
      });
  }
}

export async function assign(opt: SlotOption) {
  const cnf = ssdx.fetchConfig();
  const licenses: string[] = [];
  slot.add(opt.init, licenses, cnf.init.permissions.licenses);
  slot.add(opt.preDeploy, licenses, cnf.pre_deploy.permissions.licenses);
  slot.add(opt.postDeploy, licenses, cnf.post_deploy.permissions.licenses);

  if (licenses.length === 0) return;

  for (const license of licenses) {
    const spinner = ora(`LICENSE: Assigning ${license}...`).start();
    await runCmd('npx sf org:assign:permsetlicense', ['--name', license]);
    spinner.suffixText = ' Done';
    spinner.succeed();
  }
}
