import ora, { Ora } from 'ora';
import select from '@inquirer/select';
import colors from 'colors/safe.js';
import { setDevHub } from 'lib/config/sf-config.js';
import { StateAggregator, Org } from '@salesforce/core';
import { handleProcessSignals } from 'lib/process.js';

export async function chooseDevhub(): Promise<string> {
  return await new DevHub().chooseDevhub();
}

interface devHubOption {
  name: string;
  value: string;
}

const spinnerText = 'Finding DevHubs';
const cleanupText = colors.yellow('- you have many old orgs, consider a cleanup to alias.json');

export class DevHub {
  spinner: Ora;
  allAliases: string[] = [];
  aliasesProcessed: number = 0;
  allOrgs: { alias: string; org: Org }[] = [];
  allDevhubs: devHubOption[] = [];

  constructor() {
    this.spinner = ora(spinnerText).start();
    handleProcessSignals(this.spinner);
  }

  /* --------------------------------- public --------------------------------- */

  public async chooseDevhub(): Promise<string> {
    await this.getAllAliases();
    await this.getAllOrgs();

    this.getAllDevHubs();
    this.spinner.succeed();
    return await this.choose();
  }

  /* --------------------------------- private -------------------------------- */

  private async getAllAliases(): Promise<void> {
    const stateAggregator = await StateAggregator.getInstance();
    this.allAliases = Object.keys(stateAggregator.aliases.getAll());
  }

  private async getAllOrgs(): Promise<void> {
    const results = await Promise.allSettled(this.allAliases.map(async alias => this.getOrg(alias)));

    this.allOrgs = results
      .filter((r): r is PromiseFulfilledResult<{ alias: string; org: Org }> => r.status === 'fulfilled')
      .map(r => r.value);
  }

  private async getOrg(alias: string) {
    try {
      const org = await Org.create({ aliasOrUsername: alias });
      return { alias, org };
    } finally {
      this.aliasesProcessed++;
      this.updateSpinner();
    }
  }

  private getAllDevHubs(): void {
    this.allDevhubs = this.allOrgs
      .filter(({ org }) => org.isDevHubOrg() ?? false)
      .map(({ alias, org }) => ({
        name: `${colors.yellow(alias)} (${org.getUsername()})`,
        value: alias,
      }));
  }

  private get aliasCount(): number {
    return this.allAliases.length;
  }

  private get manyOrgs(): string {
    return (this.aliasCount > 10 && cleanupText) || '';
  }

  private updateSpinner(): void {
    this.spinner.text = `${spinnerText} (${this.aliasesProcessed}/${this.aliasCount}) ${this.manyOrgs}`;
  }

  private async choose(): Promise<string> {
    const devHubOptions: { name: string; value: string }[] = this.allDevhubs;

    const devHub = await select({
      message: 'Choose DevHub:',
      choices: devHubOptions,
    });

    await setDevHub(devHub);

    return devHub;
  }
}
