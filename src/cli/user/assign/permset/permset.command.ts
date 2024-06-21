import { Command } from 'commander';
import * as print from '../../../../lib/print-helper.js';
import ora from 'ora';
import * as ssdx from '../../../../lib/config/ssdx-config.js';
import { runCmd } from '../../../../lib/command-helper.js';
import * as slot from '../../../../lib/config/slot-helper.js';
import SlotOption from '../../../../dto/ssdx-config-slot.dto.js';

export default class PermsetsCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('user:assign:permsets')
      .description('Assign Permission Sets defined in ssdx-config.json')
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
  const permsets: string[] = [];
  slot.add(opt.init, permsets, cnf.init.permissions.permsets);
  slot.add(opt.preDeploy, permsets, cnf.pre_deploy.permissions.permsets);
  slot.add(opt.postDeploy, permsets, cnf.post_deploy.permissions.permsets);

  const types: string[] = [];
  slot.addLabel(opt.init, types, 'Before Dependencies');
  slot.addLabel(opt.preDeploy, types, 'Before Deploy');
  slot.addLabel(opt.postDeploy, types, 'After Deploy');

  if (permsets.length === 0) return;
  print.subheader(`Assigning Permission Sets (${types.join(', ')})`); // TODO: smaller header

  for (const permset of permsets) {
    const spinner = ora(`Assigning ${permset}`).start();
    await runCmd('npx sf org:assign:permset', ['--name', permset]);
    spinner.succeed(`Assigned ${permset}`);
  }
}
