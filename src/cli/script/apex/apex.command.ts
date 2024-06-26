import { Command } from 'commander';
import ora from 'ora';
import * as ssdx from '../../../lib/config/ssdx-config.js';
import { runCmd } from '../../../lib/command-helper.js';
import * as slot from '../../../lib/config/slot-helper.js';
import SlotOption from '../../../dto/ssdx-config-slot.dto.js';
import { getDefaultOrg } from '../../create/steps/devhub.js';

export default class ApexCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('script:apex')
      .description('Run Apex scripts defined in ssdx-config.json')
      .option('--target-org', 'The org to run the scripts on')
      .option('--init', 'Runs before dependencies', false)
      .option('--pre_deploy', 'Runs before deploy', false)
      .option('--post_deploy', 'Runs after deploy', false)
      .action((options: SlotOption) => {
        void runScript(options);
      });
  }
}

export async function runScript(opt: SlotOption) {
  opt.targetOrg = opt.targetOrg ?? (await getDefaultOrg());
  const cnf = ssdx.fetchConfig();
  const apexFiles: string[] = [];
  slot.add(opt.init, apexFiles, cnf.init.scripts.apex);
  slot.add(opt.preDeploy, apexFiles, cnf.pre_deploy.scripts.apex);
  slot.add(opt.postDeploy, apexFiles, cnf.post_deploy.scripts.apex);

  if (apexFiles.length === 0) return;

  for (const apexFile of apexFiles) {
    const spinner = ora(`APEX: Running ${apexFile}...`).start();
    await runCmd('npx sf apex:run', [
      '--file',
      apexFile,
      '--target-org',
      opt.targetOrg,
    ]);
    spinner.suffixText = ' Done';
    spinner.succeed();
  }
}
