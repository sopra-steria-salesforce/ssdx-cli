import { Command } from 'commander';
import ora from 'ora';
import * as ssdx from '../../../../lib/config/ssdx-config.js';
import { runCmd } from '../../../../lib/command-helper.js';
import * as slot from '../../../../lib/config/slot-helper.js';
import SlotOption from '../../../../dto/ssdx-config-slot.dto.js';
import { getDefaultOrg } from '../../../create/steps/devhub.js';

export default class PermsetsCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('user:assign:permsets')
      .description('Assign Permission Sets defined in ssdx-config.json')
      .option('--target-org', 'The org to run the scripts on')
      .option('--init', 'Assigns before dependencies', false)
      .option('--pre_deploy', 'Assigns before deploy', false)
      .option('--post_deploy', 'Assigns after deploy', false)
      .action((options: SlotOption) => {
        void assign(options);
      });
  }
}

export async function assign(opt: SlotOption) {
  opt.targetOrg = opt.targetOrg ?? (await getDefaultOrg());
  const cnf = ssdx.fetchConfig();
  const permsets: string[] = [];
  slot.add(opt.init, permsets, cnf.init.permissions.permsets);
  slot.add(opt.preDeploy, permsets, cnf.pre_deploy.permissions.permsets);
  slot.add(opt.postDeploy, permsets, cnf.post_deploy.permissions.permsets);

  if (permsets.length === 0) return;

  for (const permset of permsets) {
    const spinner = ora(`PERMISSION SET: Assigning ${permset}...`).start();
    await runCmd('npx sf org:assign:permset', [
      '--name',
      permset,
      '--target-org',
      opt.targetOrg,
    ]);
    spinner.suffixText = ' Done';
    spinner.succeed();
  }
}
