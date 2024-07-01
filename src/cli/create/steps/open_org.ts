import * as print from 'lib/print-helper.js';
import CreateOptions from '../dto/create-options.dto.js';
import { run, OutputType } from 'lib/command-helper.js';

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
    await run({
      cmd: 'npx sf org:open',
      args: ['--target-org', this.options.scratchOrgName],
      outputType: OutputType.Spinner,
      spinnerText: 'Opened Org Successfully',
    });
  }
}
