import { Command } from 'commander';
import LicenseCommand from './permset-license/license.command.js';
import PermsetsCommand from './permset/permset.command.js';

export default class AssignCommand {
  program: Command;
  licenseCmd: LicenseCommand;
  permsetsCmd: PermsetsCommand;

  constructor(program: Command) {
    this.program = program;
    this.licenseCmd = new LicenseCommand(this.program);
    this.permsetsCmd = new PermsetsCommand(this.program);

    // this.program
    //   .command('user:assign:permset')
    //   .description('')
    //   .option('-n, --env-name <string>', 'The local name of the Scratch Org')
    //   .action((options: UserOptions) => {
    //     authenticateOrg(options);
    //   });
  }
}
