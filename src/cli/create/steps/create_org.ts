import ora from 'ora';
import { Duration } from '@salesforce/kit';
import fs from 'node:fs';
import path from 'node:path';
import * as print from '../../../lib/print-helper.js';
import { input } from '@inquirer/prompts';
import select from '@inquirer/select';

import CreateOptions from '../dto/create-options.dto.js';
import {
  Org,
  scratchOrgCreate,
  ScratchOrgCreateResult,
  ScratchOrgCreateOptions,
} from '@salesforce/core';

export async function createScratchOrg(options: CreateOptions): Promise<void> {
  const org = new create_org(options);
  await org.createScratchOrg();
}

class create_org {
  options!: CreateOptions;
  scratchOrgConfig: ScratchOrgCreateOptions;
  scratchOrgResult!: ScratchOrgCreateResult;

  constructor(options: CreateOptions) {
    this.options = options;
    this.scratchOrgConfig = {
      hubOrg: {} as Org,
    };
  }

  public async createScratchOrg(): Promise<void> {
    print.header('Create Scratch Org');
    await this.setDevhub();
    await this.verifyPackageKey();
    await this.setAlias();
    this.setScratchOrgConfig();
    await this.chooseConfig();
    // await this.createOrg();
  }

  private async chooseConfig() {
    const options: { name: string; value: string }[] = [];
    const configFolderPath = './config/';

    fs.readdirSync(configFolderPath).forEach(file => {
      options.push({ name: file, value: file });
    });

    const answer = await select({
      message: 'Select project definition file:',
      choices: options,
    });

    this.scratchOrgConfig.orgConfig = JSON.parse(
      fs.readFileSync(path.join(configFolderPath, answer), 'utf8')
    );
  }

  private async setDevhub(): Promise<void> {
    this.scratchOrgConfig.hubOrg = await Org.create({
      aliasOrUsername: 'elvia_prod',
    });
  }
  private async verifyPackageKey(): Promise<void> {}
  private async setAlias(): Promise<void> {
    this.scratchOrgConfig.alias =
      this.options.scratchOrgName === undefined
        ? await input({ message: 'Enter Scratch Org name:' })
        : this.options.scratchOrgName;
  }
  private setScratchOrgConfig(): void {
    this.scratchOrgConfig.durationDays = parseInt(this.options.durationDays);
    this.scratchOrgConfig.wait = new Duration(45, Duration.Unit.MINUTES);
    this.scratchOrgConfig.setDefault = true;
    this.scratchOrgConfig.orgConfig = {
      orgName: 'Elvia',
      snapshot: 'full_snapshot',
    };
  }

  private async createOrg(): Promise<void> {
    const spinner = ora('Creating Scratch Org').start();

    try {
      this.scratchOrgResult = await scratchOrgCreate(this.scratchOrgConfig);
      spinner.suffixText = `(successfully created org ${this.scratchOrgResult.username})`;
      spinner.succeed();
    } catch (error) {
      spinner.fail(JSON.stringify(error));
    }
  }
}
