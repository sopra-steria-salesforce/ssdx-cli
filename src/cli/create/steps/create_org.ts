import * as print from 'lib/print-helper.js';
import colors from 'colors/safe.js';
import ora, { Ora } from 'ora';
import CreateOptions from '../create.dto.js';
import { ScratchOrgCreateOptions, scratchOrgCreate, Org, ScratchOrgCreateResult } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { handleProcessSignals } from 'lib/process.js';
import { getDevHub, readOrgDefinition } from 'lib/config/sf-config.js';
import { throwError } from 'lib/log.js';

export async function createScratchOrg(): Promise<void> {
  const org = new create_org();

  if (CreateOptions.keepExistingOrg) {
    org.keepScratchOrg();
    return;
  }

  org.init();
  await org.setDevHub();
  await org.setOrgConfig();
  await org.createScratchOrg();
}

class create_org {
  spinner!: Ora;
  hubOrg!: Org;
  orgConfig!: Record<string, unknown>;

  constructor() {}

  public init(): void {
    this.spinner = ora('Creating Scratch Org').start();
    handleProcessSignals(this.spinner);
  }

  public async setDevHub(): Promise<void> {
    this.hubOrg = await getDevHub();
  }

  public async setOrgConfig(): Promise<void> {
    this.orgConfig = await readOrgDefinition();
  }

  get scratchOrgOptions(): ScratchOrgCreateOptions {
    return {
      hubOrg: this.hubOrg,
      alias: CreateOptions.scratchOrgName,
      durationDays: parseInt(CreateOptions.durationDays),
      orgConfig: this.orgConfig,
      wait: Duration.minutes(45),
      setDefault: true, // TODO: set to false and make default at the end of the process
      tracksSource: true,
    };
  }

  private get successText(): string {
    return `Scratch Org created successfully with alias: ${CreateOptions.scratchOrgName || ''}`;
  }

  public keepScratchOrg(): void {
    CreateOptions.scratchOrgResult = { username: CreateOptions.scratchOrgName } as ScratchOrgCreateResult;
  }

  public async createScratchOrg(): Promise<void> {
    try {
      CreateOptions.scratchOrgResult = await scratchOrgCreate(this.scratchOrgOptions);

      this.spinner.suffixText = `... created: ${colors.yellow(CreateOptions.scratchOrgResult.username || '')}`;
      this.spinner.succeed();
      print.log(this.successText);
    } catch (error) {
      this.spinner.fail('Failed to create Scratch Org');
      throwError(String(error));
    }
  }
}
