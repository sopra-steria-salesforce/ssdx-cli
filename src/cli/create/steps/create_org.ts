import ora from 'ora';
import { Duration } from '@salesforce/kit';
import fs from 'node:fs';
import path from 'node:path';
import * as print from '../../../lib/print-helper.js';
import { input, password } from '@inquirer/prompts';
import select from '@inquirer/select';
import CreateOptions from '../dto/create-options.dto.js';
import { chooseDevhub, getDefaultDevhub } from './devhub.js';
import {
  Org,
  scratchOrgCreate,
  ScratchOrgCreateResult,
  ScratchOrgCreateOptions,
} from '@salesforce/core';
import { exit } from 'node:process';

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
    await this.setAlias();
    await this.chooseConfig();
    await this.verifyPackageKey();
    await this.findDevhub();
    await this.setDevhub();
    this.setScratchOrgConfig();
    await this.createOrg();
  }

  private async setAlias(): Promise<void> {
    this.scratchOrgConfig.alias =
      this.options.scratchOrgName === undefined
        ? await input({ message: 'Enter Scratch Org name:' })
        : this.options.scratchOrgName;
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

  private async verifyPackageKey(): Promise<void> {
    const packageKeyPath = './.sf/package.key';
    if (fs.existsSync(packageKeyPath)) {
      this.options.packageKey = fs.readFileSync(packageKeyPath, 'utf8');
    } else {
      this.options.packageKey = await password({
        message: 'Enter package key:',
      });
      fs.writeFileSync(packageKeyPath, this.options.packageKey);
    }
  }

  private async findDevhub(): Promise<void> {
    if (this.options.targetDevHub) {
      return;
    }

    const defaultDevhub = getDefaultDevhub();
    this.options.targetDevHub = defaultDevhub
      ? defaultDevhub
      : await chooseDevhub();
  }

  private async setDevhub(): Promise<void> {
    this.scratchOrgConfig.hubOrg = await Org.create({
      aliasOrUsername: this.options.targetDevHub,
    });
  }

  private setScratchOrgConfig(): void {
    this.scratchOrgConfig.durationDays = parseInt(this.options.durationDays);
    this.scratchOrgConfig.wait = new Duration(45, Duration.Unit.MINUTES);
    this.scratchOrgConfig.setDefault = true;
  }

  private async createOrg(): Promise<void> {
    const spinner = ora('Creating Scratch Org').start();
    this.options.scratchOrgUsername = 'test-ztvlb54dmg9e@example.com';
    spinner.succeed();

    try {
      this.scratchOrgResult = await scratchOrgCreate(this.scratchOrgConfig);
      const username = this.scratchOrgResult.username ?? '';
      spinner.suffixText = `(successfully created org ${username})`;
      this.options.scratchOrgUsername = username;
      spinner.succeed();
    } catch (error) {
      spinner.fail('Failed to create Scratch Org');
      console.error(error);
      exit(1);
    }
  }
}
