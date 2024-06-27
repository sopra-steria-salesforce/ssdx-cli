import { Command } from 'commander';
import CreateOptions from './dto/create-options.dto.js';
import { createScratchOrg } from './steps/create_org.js';
import { installDependencies } from './steps/dependencies.js';
import { initialize } from './steps/initializer.js';
import { clearingTracking, deployMetadata } from './steps/deploy_metadata.js';
import { openOrg } from './steps/open_org.js';
import { getSlotOptions } from '../resource-assignment-manager/dto/resource-config.dto.js';
import { resourceAssignmentManager } from '../resource-assignment-manager/resource.command.js';

export default class CreateCommand {
  options!: CreateOptions;
  program: Command;

  constructor(program: Command) {
    this.program = program;

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
        '-c, --config-file <string>',
        'The Scratch Org config file (see ssdx-config.json for default value)'
      )
      .option(
        '-v, --target-dev-hub <string>',
        'The alias or username of the dev hub org'
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

    // assigner slots
    // TODO: change slot options to default options
    const { preDependencies, preDeploy, postDeploy } = getSlotOptions(
      this.options.scratchOrgName
    );

    // dependency install
    await resourceAssignmentManager(preDependencies);
    await installDependencies(this.options);

    // deployment
    await resourceAssignmentManager(preDeploy);
    await deployMetadata(this.options);
    await resourceAssignmentManager(postDeploy);
    await clearingTracking(this.options);

    await openOrg(this.options);
  }
}
