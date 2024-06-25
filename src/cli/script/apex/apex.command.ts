import { Command } from 'commander';
import ora from 'ora';
import * as ssdx from '../../../lib/config/ssdx-config.js';
import { runCmd } from '../../../lib/command-helper.js';
import * as slot from '../../../lib/config/slot-helper.js';
import SlotOption from '../../../dto/ssdx-config-slot.dto.js';

export default class ApexCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('script:apex')
      .description('Run Apex scripts defined in ssdx-config.json')
      .option('--init', 'Runs before dependencies', false)
      .option('--pre_deploy', 'Runs before deploy', false)
      .option('--post_deploy', 'Runs after deploy', false)
      .action((options: SlotOption) => {
        void runScript(options);
      });
  }
}

export async function runScript(opt: SlotOption) {
  const cnf = ssdx.fetchConfig();
  const apexFiles: string[] = [];
  slot.add(opt.init, apexFiles, cnf.init.scripts.apex);
  slot.add(opt.preDeploy, apexFiles, cnf.pre_deploy.scripts.apex);
  slot.add(opt.postDeploy, apexFiles, cnf.post_deploy.scripts.apex);

  const types: string[] = [];
  slot.addLabel(opt.init, types, 'Before Dependencies');
  slot.addLabel(opt.preDeploy, types, 'Before Deployment');
  slot.addLabel(opt.postDeploy, types, 'After Deployment');

  if (apexFiles.length === 0) return;

  for (const apexFile of apexFiles) {
    const spinner = ora(`APEX: Running ${apexFile}...`).start();
    await runCmd('npx sf apex:run', ['--file', apexFile]);
    spinner.suffixText = ' Done';
    spinner.succeed();
  }
}
