import { Command } from 'commander';
import CreateCommand from './create/create.command.js';
import AuthCommand from './auth/auth.command.js';
import { run } from '../lib/command-helper.js';

class cli {
  protected static program = new Command();

  public getProgram(): Command {
    return cli.program;
  }

  constructor() {
    new AuthCommand(cli.program);
    new CreateCommand(cli.program);
  }

  public async run(): Promise<void> {
    await this.setDefaultConfig();
    cli.program
      .name('ssdx-cli')
      .description('Salesforce DX cli helper tool')
      .version('0.8.0'); // fetch from package.json

    cli.program.parse();
  }

  async setDefaultConfig() {
    await run('export SF_SKIP_NEW_VERSION_CHECK=true');
    await run('export FORCE_SHOW_SPINNER=true');
    await run('export SF_CAPITALIZE_RECORD_TYPES=true');
  }
}

export default cli;
