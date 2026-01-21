import * as print from 'lib/print-helper.js';
import colors from 'colors/safe.js';
import { Command } from 'commander';
import CreateOptions from './create.dto.js';
import { createScratchOrg } from './steps/create_org.js';
import { installDependencies } from './steps/dependencies.js';
import { initialize } from './steps/initializer.js';
import { clearingTracking, deployMetadata } from './steps/deploy_metadata.js';
import { openOrg } from './steps/open_org.js';
import { delete_question } from './steps/delete-existing.js';
import {
  startResourcePostDeploy,
  startResourcePreDependencies,
  startResourcePreDeploy,
} from 'cli/resource-assignment-manager/resource-assignment-manager.js';
import { addBaseOptions } from 'dto/base.dto.js';
import { fetchOrgFromPool } from './steps/fetch_org_from_pool.js';

export default class CreateCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    const createCommand = this.program
      .command('create')
      .description('Create a Scratch org')

      .optionsGroup('Parameters')
      .option(`-n, --scratch-org-name ${colors.yellow('<string>')}`, 'The alias to give the Scratch Org')
      .option(`-d, --duration-days ${colors.yellow('<number>')}`, 'The amount of days to keep the Scratch Org', '5')
      .option(
        `-c, --config-file ${colors.yellow('<string>')}`,
        'The Scratch Org config file (see ssdx-config.json for default value)'
      )
      .option(`-v, --target-dev-hub ${colors.yellow('<string>')}`, 'The alias or username of the dev hub org')

      .optionsGroup('Flags')
      .option('--delete-current-org', 'Delete the current Scratch Org')
      .option('--skip-dependencies', 'Skip dependency installation')
      .option('--skip-deployment', 'Skip deployment step')
      .option('--keep-existing-org', 'Keep the existing Scratch Org')
      .option('--enable-pools', 'Enable sfp pools usage');

    // Apply base options to the create command, not the main program
    addBaseOptions(createCommand);

    createCommand.action((options: typeof CreateOptions) => {
      CreateOptions.setFields(options);
      void this.main();
    });
  }

  private async main() {
    await initialize();
    await delete_question(); // TODO: fix with pools
    await fetchOrgFromPool();
    await createScratchOrg();

    // dependency install
    await startResourcePreDependencies();
    await installDependencies();

    // deployment
    await startResourcePreDeploy();
    await deployMetadata();
    await startResourcePostDeploy();
    await clearingTracking();

    await openOrg();

    const text = `Scratch Org created successfully (alias: ${CreateOptions.scratchOrgName})`;
    print.info(text);
    print.notificationSuccess(text);
  }
}
