import { Command } from 'commander';
import * as print from 'lib/print-helper.js';
import AuthOptions from './dto/auth-options.dto.js';

export default class AuthCommand {
  program: Command;
  constructor(program: Command) {
    this.program = program;

    this.program
      .command('auth')
      .description('Authenticate an org')
      .option('-n, --env-name <string>', 'The local name of the Scratch Org')
      .action((options: AuthOptions) => {
        authenticateOrg(options);
      });
  }
}

function authenticateOrg(options: AuthOptions): void {
  console.log(options);

  print.subheader('Auth org');
}
