import { Command } from 'commander';
import CreateOptions from './dto/create-options.dto.js';
import { createScratchOrg } from './steps/create_org.js';
import { installDependencies } from './steps/dependencies.js';
import { initialize } from './steps/initializer.js';
import { deployMetadata } from './steps/deploy_metadata.js';

export default class CreateCommand {
  options!: CreateOptions;
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('create')
      .description('Create a Scratch org')
      .option(
        '-d, --duration-days <number>',
        'The amount of days to keep the Scratch Org (default: 5)',
        '5'
      )
      .option(
        '-n, --scratch-org-name <string>',
        'The alias to give the Scratch Org'
      )
      .option(
        '-v, --target-dev-hub <string>',
        'The alias or username of the dev hub org'
      )
      .action((options: CreateOptions) => {
        this.options = options;
        void this.main();
      });
  }
  private async main() {
    await initialize(this.options);
    await createScratchOrg(this.options);
    await installDependencies(this.options);
    await deployMetadata(this.options);
  }
}
