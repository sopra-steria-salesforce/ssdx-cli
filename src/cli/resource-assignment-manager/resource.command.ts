import { Command } from 'commander';
import { SlotOption } from './dto/resource-config.dto.js';
import { getDefaultOrg } from 'cli/create/steps/devhub.js';
import { ResourceAssignmentManager } from './resource-assignment-manager.js';
import {
  Color,
  setColor,
  setColors,
} from 'lib/print-helper/print-helper-formatter.js';

const DESCRIPTION = `${setColors('Configurable resource assignment to orgs. This option allows:', [Color.yellow, Color.bold])}
  - Running Apex
  - Running JS
  - Assigning Permission Sets
  - Assigning Permission Set Licenses
  - Deploying source- or non-source tracked metadata

All configurations are defined in ${setColor('ssdx-config.json', Color.yellow)}.`;

export class ResourceCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    // TODO: make at least one option required
    this.program
      .command('resource')
      .description(DESCRIPTION)
      .option('-o --target-org <string>', 'The org to run the scripts on')
      .option('--pre-dependencies', 'Runs "pre_dependencies" resources', false)
      .option('--pre-deploy', 'Runs "pre_deploy" resources', false)
      .option('--post-deploy', 'Runs "post_deploy" resources', false)
      .option('--post-install', 'Runs "post_install" resources', false)
      .option('--show-output', 'Show output of resource assignments', false)
      .option('--ci', 'Disables fancy feature for a slimmer output', false)
      .action((options: SlotOption) => {
        void resourceAssignmentManager(options);
      });
  }
}

export async function resourceAssignmentManager(options: SlotOption) {
  const targetOrg = options.targetOrg ?? (await getDefaultOrg());
  console.log(targetOrg);

  const resource = new ResourceAssignmentManager(options, targetOrg);
  await resource.run();
}
