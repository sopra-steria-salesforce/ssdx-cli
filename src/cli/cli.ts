import { Command } from 'commander';
import CreateCommand from './create/create.command.js';
import AuthCommand from './auth/auth.command.js';

class cli {
  protected static program = new Command();

  public getProgram(): Command {
    return cli.program;
  }

  constructor() {
    new AuthCommand(cli.program);
    new CreateCommand(cli.program);
  }

  public run(): void {
    cli.program
      .name('ssdx-cli')
      .description('Salesforce DX cli helper tool')
      .version('0.8.0'); // TODO: fetch from package.json

    cli.program.parse();
  }
}

export default cli;
