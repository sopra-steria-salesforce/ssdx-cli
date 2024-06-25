import * as print from '../../../lib/print-helper.js';
import CreateOptions from '../dto/create-options.dto.js';
import { run, Output } from '../../../lib/command-helper.js';
import ora from 'ora';

export async function openOrg(options: CreateOptions): Promise<void> {
  const org = new OrgOpener(options);
  await org.open();
}

class OrgOpener {
  options: CreateOptions;

  constructor(options: CreateOptions) {
    this.options = options;
  }

  public async open(): Promise<void> {
    print.subheader('Opening Scratch Org');
    await run(
      'npx sf org:open',
      ['--target-org', this.options.scratchOrgName],
      Output.Supressed
    );

    const spinner = ora('Installed Dependencies Successfully').start();
    spinner.succeed();
  }
}
