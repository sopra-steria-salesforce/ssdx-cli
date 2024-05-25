import { Command } from 'commander';
import AuthOptions from './dto/auth-options.dto';

class AuthCommand {
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

export default AuthCommand;

function authenticateOrg(options: AuthOptions): void {
  console.log('Auth org');
  console.log(`Name: ${options.envName}`);
}
