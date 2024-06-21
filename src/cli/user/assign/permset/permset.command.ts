import { Command } from 'commander';
import * as print from '../../../../lib/print-helper.js';
import ora from 'ora';
import * as ssdx from '../../../../lib/ssdx-config.js';
import { runCmd } from '../../../../lib/command-helper.js';
import * as assigner from '../assigner-helper.js';
import AssignOptions from '../../../../dto/ssdx-config-slot.dto.js';

export default class PermsetsCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('user:assign:permsets')
      .description('')
      .option('--init', 'Assign permission sets before dependencies', false)
      .option('--pre_deploy', 'Assign permission sets before deployment', false)
      .option('--post_deploy', 'Assign permission sets after deployment', false)
      .action((options: AssignOptions) => {
        void assign(options);
      });
  }
}

export async function assign(opt: AssignOptions) {
  const cnf = ssdx.fetchConfig();
  const permsets: string[] = [];
  assigner.add(opt.init, permsets, cnf.init.permissions.permsets);
  assigner.add(opt.preDeploy, permsets, cnf.pre_deploy.permissions.permsets);
  assigner.add(opt.postDeploy, permsets, cnf.post_deploy.permissions.permsets);

  const types: string[] = [];
  assigner.addLabel(opt.init, types, 'Before Dependencies');
  assigner.addLabel(opt.preDeploy, types, 'Before Deployment');
  assigner.addLabel(opt.postDeploy, types, 'After Deployment');

  if (permsets.length === 0) return;
  print.subheader(`Assigning Permission Sets (${types.join(', ')})`); // TODO: smaller header

  for (const permset of permsets) {
    const spinner = ora(`Assigning ${permset}`).start();
    await runCmd('npx sf org:assign:permset', ['--name', permset]);
    spinner.succeed(`Assigned ${permset}`);
  }
}
