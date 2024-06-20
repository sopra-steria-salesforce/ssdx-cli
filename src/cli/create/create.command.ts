import { Command } from 'commander';
import CreateOptions from './dto/create-options.dto.js';
import { createScratchOrg } from './steps/create_org.js';
import { installDependencies } from './steps/dependencies.js';
import { initialize } from './steps/initializer.js';
import { deployMetadata } from './steps/deploy_metadata.js';
import { openOrg } from './steps/open_org.js';
import { getDefaultDevhub } from './steps/devhub.js';

export default class CreateCommand {
  options!: CreateOptions;
  program: Command;

  constructor(program: Command) {
    this.program = program;

    const devHub = getDefaultDevhub();

    this.program
      .command('create')
      .description('Create a Scratch org')
      .option(
        '-n, --scratch-org-name <string>',
        'The alias to give the Scratch Org'
      )
      .option(
        '-d, --duration-days <number>',
        'The amount of days to keep the Scratch Org',
        '5'
      )
      .option(
        '-v, --target-dev-hub <string>',
        'The alias or username of the dev hub org',
        devHub
      )
      .option('--skip-dependencies', 'Skip dependency installation')
      .option('--skip-deployment', 'Skip deployment step')
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
    await openOrg(this.options);
  }
}
