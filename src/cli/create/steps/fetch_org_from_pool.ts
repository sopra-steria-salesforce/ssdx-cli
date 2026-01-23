// import ora, { Ora } from 'ora';
import { Ora } from 'ora';
import CreateOptions from '../create.dto.js';
import { handleProcessSignals } from 'lib/process.js';
import { run, OutputType, CmdResult } from 'lib/command-helper.js';
import * as print from 'lib/print-helper.js';

export async function fetchOrgFromPool(): Promise<void> {
  const fetcher = new PoolFetcher();

  if (!fetcher.getEnablePools()) {
    return;
  }

  fetcher.init();
  await fetcher.fetchFromPool();
}

class PoolFetcher {
  spinner!: Ora;

  constructor() {}

  public getEnablePools(): boolean {
    return !!CreateOptions.enablePools;
  }

  public init(): void {
    handleProcessSignals(this.spinner);
  }

  public async fetchFromPool() {
    const results = await this.runCommand();

    if (results.code == 0) {
      CreateOptions.keepExistingOrg = 'true';
    } else {
      this.formatError(results);
    }
  }

  private formatError(results: CmdResult) {
    print.error(results.stderr.toString().split('Error: ')[1].split('\n')[0] + '\n');
  }

  public async runCommand() {
    return await run({
      cmd: 'npx sfp pool:fetch',
      args: [
        '--tag',
        this.getTag(),
        '--setdefaultusername',
        '--alias',
        `"${CreateOptions.scratchOrgName}"`,
        '--targetdevhubusername',
        CreateOptions.targetDevHub,
      ],
      outputType: OutputType.Spinner,
      spinnerText: 'Fetching Scratch Org from pool',
      spinnerErrorText: 'failed to fetch!',
      exitOnError: false,
    });
  }
  private getTag(): string {
    return CreateOptions.ci ? 'ci' : 'dev';
  }
}
