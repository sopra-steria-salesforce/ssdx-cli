import { Command } from 'commander';
import LicenseCommand from './permset-license/license.command.js';
import PermsetsCommand from './permset/permset.command.js';
import AssignOptions from './dto/assign-options.dto.js';
import * as license from '../../user/assign/permset-license/license.command.js';
import * as permset from '../../user/assign/permset/permset.command.js';

export default class AssignCommand {
  program: Command;
  licenseCmd: LicenseCommand;
  permsetsCmd: PermsetsCommand;

  constructor(program: Command) {
    this.program = program;
    this.licenseCmd = new LicenseCommand(this.program);
    this.permsetsCmd = new PermsetsCommand(this.program);

    this.program
      .command('user:assign:permset')
      .description('')
      .option('--init', 'Assign permission sets before dependencies', false)
      .option('--pre_deploy', 'Assign permission sets before deployment', false)
      .option('--post_deploy', 'Assign permission sets after deployment', false)
      .action((options: AssignOptions) => {
        void assignPermissions(options);
      });
  }
}

export async function assignPermissions(options: AssignOptions) {
  await permset.assign(options);
  await license.assign(options);
}
