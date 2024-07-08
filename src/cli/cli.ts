import { Command } from 'commander';
import CreateCommand from './create/create.command.js';
import AuthCommand from './auth/auth.command.js';
import { ResourceCommand } from './resource-assignment-manager/resource.command.js';
import { logger } from 'lib/log.js';

export default class cli {
  protected static program = new Command();

  constructor() {
    new AuthCommand(cli.program);
    new CreateCommand(cli.program);
    new ResourceCommand(cli.program);
  }

  public run(): void {
    logger.info(`SSDX version: ${process.env.npm_package_version}`);
    logger.info(`Node version: ${process.version}`);
    cli.program
      .name('ssdx-cli')
      .description('Salesforce DX cli helper tool')
      .version(process.env.npm_package_version as string);

    cli.program.parse();
  }
}
