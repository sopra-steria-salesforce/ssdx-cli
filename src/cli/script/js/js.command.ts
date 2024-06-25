import { Command } from 'commander';
import ora from 'ora';
import * as ssdx from '../../../lib/config/ssdx-config.js';
import { runCmd } from '../../../lib/command-helper.js';
import * as slot from '../../../lib/config/slot-helper.js';
import SlotOption from '../../../dto/ssdx-config-slot.dto.js';

export default class jsFilesCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('script:js')
      .description('Run js scripts defined in ssdx-config.json')
      .option('--init', 'Run js scripts before dependencies', false)
      .option('--pre_deploy', 'Run js scripts before deploy', false)
      .option('--post_deploy', 'Run js scripts after deploy', false)
      .action((options: SlotOption) => {
        void runScripts(options);
      });
  }
}

export async function runScripts(opt: SlotOption) {
  const cnf = ssdx.fetchConfig();
  const jsFiles: string[] = [];
  slot.add(opt.init, jsFiles, cnf.init.scripts.js);
  slot.add(opt.preDeploy, jsFiles, cnf.pre_deploy.scripts.js);
  slot.add(opt.postDeploy, jsFiles, cnf.post_deploy.scripts.js);

  const types: string[] = [];
  slot.addLabel(opt.init, types, 'Before Dependencies');
  slot.addLabel(opt.preDeploy, types, 'Before Deployment');
  slot.addLabel(opt.postDeploy, types, 'After Deployment');

  if (jsFiles.length === 0) return;

  for (const jsFile of jsFiles) {
    const spinner = ora(`JAVASCRIPT: Running ${jsFile}...`).start();
    await runCmd('node', [jsFile]);
    spinner.suffixText = ' Done';
    spinner.succeed();
  }
}
