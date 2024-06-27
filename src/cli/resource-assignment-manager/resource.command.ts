import { Command } from 'commander';
import { SlotOption } from './dto/resource-config.dto.js';
import { getDefaultOrg } from '../create/steps/devhub.js';
import { ResourceAssignmentManager } from './resource-assignment-manager.js';

const NAME = 'Resource Assignment Manager';
const DESCRIPTION =
  'Can run Apex and js scripts, assign Permission Sets and Permission Set Licenses, and lastly deploy method stored anywhere. All configurations are defined in ssdx-config.json.';

export class ResourceCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('resource')
      .name(NAME)
      .description(DESCRIPTION)
      .option('--target-org', 'The org to run the scripts on')
      .option('--pre-dependencies', 'Assigns before dependencies', false)
      .option('--pre_deploy', 'Assigns before deploy', false)
      .option('--post_deploy', 'Assigns after deploy', false)
      .action((options: SlotOption) => {
        void resourceAssignmentManager(options);
      });
  }
}

export async function resourceAssignmentManager(options: SlotOption) {
  const targetOrg = options.targetOrg ?? (await getDefaultOrg());
  const resource = new ResourceAssignmentManager(options, targetOrg);
  await resource.run();
}
