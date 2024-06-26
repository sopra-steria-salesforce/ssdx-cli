import { Command } from 'commander';
import LicenseCommand from './permset-license/license.command.js';
import PermsetsCommand from './permset/permset.command.js';
import SlotOption from '../../../dto/ssdx-config-slot.dto.js';
import * as license from '../../user/assign/permset-license/license.command.js';
import * as permset from '../../user/assign/permset/permset.command.js';
import { getDefaultOrg } from '../../create/steps/devhub.js';

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
      .description(
        'Assign Permission Sets and Licenses defined in ssdx-config.json'
      )
      .option('--target-org', 'The org to run the scripts on')
      .option('--init', 'Assign before dependencies', false)
      .option('--pre_deploy', 'Assign before deploy', false)
      .option('--post_deploy', 'Assign after deploy', false)
      .action((options: SlotOption) => {
        void assignPermissions(options);
      });
  }
}

export async function assignPermissions(options: SlotOption) {
  options.targetOrg = options.targetOrg ?? (await getDefaultOrg());
  await permset.assign(options);
  await license.assign(options);
}
