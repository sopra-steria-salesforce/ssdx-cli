import * as print from '../../lib/print-helper.js';
import { Command } from 'commander';
import CreateOptions from './dto/create-options.dto.js';
import { createScratchOrg } from './steps/create_org.js';
import { installDependencies } from './steps/dependencies.js';
import { initialize } from './steps/initializer.js';
import { clearingTracking, deployMetadata } from './steps/deploy_metadata.js';
import { openOrg } from './steps/open_org.js';
import * as assign from '../../dto/ssdx-config-slot.dto.js';
import { assignPermissions } from '../user/assign/assign.command.js';
import { runScripts } from 'cli/script/script.command.js';

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

    // pre-dependencies
    print.subheader('Pre-dependency Steps', undefined, print.Color.bgCyan);
    await assignPermissions(assign.init);
    await runScripts(assign.init);

    // dependency install
    await installDependencies(this.options);

    // pre-deployment
    print.subheader('Pre-deployment Steps', undefined, print.Color.bgCyan);
    await assignPermissions(assign.preDeploy);
    await runScripts(assign.preDeploy);

    // deployment
    await deployMetadata(this.options);

    // post-deployment
    print.subheader('Post Deployment Steps', undefined, print.Color.bgCyan);
    await assignPermissions(assign.postDeploy);
    await runScripts(assign.postDeploy);
    await clearingTracking(this.options);

    await openOrg(this.options);
  }
}
