import { Command } from 'commander';
import * as print from '../../../../lib/print-helper.js';
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
      .description('')
      .option('--init', 'Assign licenses before dependencies', false)
      .option('--pre_deploy', 'Assign licenses before deployment', false)
      .option('--post_deploy', 'Assign licenses after deployment', false)
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

  const types: string[] = [];
  slot.addLabel(opt.init, types, 'Before Dependencies');
  slot.addLabel(opt.preDeploy, types, 'Before Deployment');
  slot.addLabel(opt.postDeploy, types, 'After Deployment');

  if (licenses.length === 0) return;
  print.subheader(`Assigning Permission Set Licenses (${types.join(', ')})`); // TODO: smaller header

  for (const license of licenses) {
    const spinner = ora(`Assigning ${license}`).start();
    await runCmd('npx sf org:assign:permsetlicense', ['--name', license]);
    spinner.succeed(`Assigned ${license}`);
  }
}
