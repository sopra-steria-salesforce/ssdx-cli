import ora from 'ora';
import CreateOptions from '../dto/create-options.dto.js';
import * as print from 'lib/print-helper.js';
import { run, OutputType } from 'lib/command-helper.js';

export async function deployMetadata(options: CreateOptions): Promise<void> {
  const metadata = new Metadata(options);
  await metadata.deploy();
}

export async function clearingTracking(options: CreateOptions): Promise<void> {
  const metadata = new Metadata(options);
  await metadata.resetTracking();
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
    // TODO: move to new metadata class
    await run({
      cmd: 'npx sf project:deploy:start',
      args: [
        '--wait',
        '30',
        '--target-org',
        this.alias,
        '--ignore-conflicts',
        '--concise',
      ],
      outputType: OutputType.OutputLiveAndClearPipe,
    });

    console.log('');
    const spinner = ora('Deployed Metadata Successfully').start();
    spinner.succeed();
  }

  public async resetTracking(): Promise<void> {
    await run({
      cmd: 'npx sf project:reset:tracking',
      args: ['--target-org', this.alias, '--no-prompt'],
      spinnerText: 'Resetting Metadata Tracking',
      outputType: OutputType.Spinner,
    });
  }

  private get alias(): string {
    return this.options.scratchOrgName ?? '';
  }
}
