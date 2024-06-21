import { Command } from 'commander';
import AssignCommand from './assign.command.js';

export default class UserCommand {
  program: Command;
  assignCmd: AssignCommand;
  constructor(program: Command) {
    this.program = program;
    this.assignCmd = new AssignCommand(this.program);

    // this.program
    //   .command('user:assign:permset')
    //   .description('')
    //   .option('-n, --env-name <string>', 'The local name of the Scratch Org')
    //   .action((options: UserOptions) => {
    //     authenticateOrg(options);
    //   });
  }
}
