import { Command } from 'commander';
import CreateCommand from './create/create.command.js';
import AuthCommand from './auth/auth.command.js';
import { execSync } from 'node:child_process';

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
    this.setDefaultConfig();
    cli.program
      .name('ssdx-cli')
      .description('Salesforce DX cli helper tool')
      .version('0.8.0'); // fetch from package.json

    cli.program.parse();
  }

  // TODO: fix
  setDefaultConfig() {
    execSync('export SF_SKIP_NEW_VERSION_CHECK=true');
    execSync('export FORCE_SHOW_SPINNER=true');
    execSync('export SF_CAPITALIZE_RECORD_TYPES=true');
  }
}

export default cli;
