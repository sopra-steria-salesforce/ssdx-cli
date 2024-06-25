import ora from 'ora';
import CreateOptions from '../dto/create-options.dto.js';
import * as print from '../../../lib/print-helper.js';
import { run, Output } from '../../../lib/command-helper.js';

export async function deployMetadata(options: CreateOptions): Promise<void> {
  const metadata = new Metadata(options);
  await metadata.deploy();
}

class Metadata {
  options!: CreateOptions;

  constructor(options: CreateOptions) {
    this.options = options;
  }

  public async deploy(): Promise<void> {
    print.subheader('Deploy Metadata');

    if (this.options.skipDeployment) {
      print.warning('Skipping deployment');
      return;
    }

    await run(
      'npx sf project:deploy:start',
      ['--wait', '30', '--target-org', this.alias],
      Output.LiveAndClear
    );

    console.log('');
    const spinner = ora('Deployed Metadata Successfully').start();
    spinner.succeed();
  }

  private get alias(): string {
    return this.options.scratchOrgName ?? '';
  }
}
