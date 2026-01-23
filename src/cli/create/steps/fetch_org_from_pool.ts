// import ora, { Ora } from 'ora';
import { Ora } from 'ora';
import CreateOptions from '../create.dto.js';
import { handleProcessSignals } from 'lib/process.js';
import { run, OutputType } from 'lib/command-helper.js';

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
    }
    // TODO: handle code 1 (output error), handle non-0 and non-1
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

  private get successText(): string {
    return `Fetched Scratch Org from pool. Stored as '${CreateOptions.scratchOrgName || ''}' and set as default.`;
  }

  private get errorText(): string {
    return 'error';
  }
}
