import * as print from '../../lib/print-helper.js';
import { Command } from 'commander';
import ora from 'ora';
import * as ssdx from '../../lib/config/ssdx-config.js';
import { runCmd } from '../../lib/command-helper.js';
import * as slot from '../../lib/config/slot-helper.js';
import SlotOption from '../../dto/ssdx-config-slot.dto.js';

export default class MetadataCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('metadata')
      .description('Deploys all metadata defined in ssdx-config.json')
      .option('--init', 'Pre-dependency metadata', false)
      .option('--pre_deploy', 'Pre-deploy metadata', false)
      .option('--normal', 'Normal metadata deployment', false)
      .option('--post_deploy', 'Post-deploy metadata', false)
      .action((options: SlotOption) => {
        void deployManualMetadata(options);
      });
  }
}
// TODO: add options to speicify target org
export async function deployManualMetadata(opt: SlotOption) {
  const cnf = ssdx.fetchConfig();
  const metadataFiles: string[] = [];
  slot.add(opt.init, metadataFiles, cnf.init.metadata);
  slot.add(opt.preDeploy, metadataFiles, cnf.pre_deploy.metadata);
  slot.add(opt.postDeploy, metadataFiles, cnf.post_deploy.metadata);

  if (opt.normal) {
    print.warning('Not implemented yet');
  }

  if (metadataFiles.length === 0) return;

  for (const metadata of metadataFiles) {
    const spinner = ora(`METADATA: Deploying ${metadata}...`).start();
    await runCmd('npx sf project:deploy:start', [
      '--source-dir',
      metadata,
      '--ignore-conflicts',
      '--concise',
    ]);
    spinner.suffixText = ' Done';
    spinner.succeed();
  }
}
