import { Duration } from '@salesforce/kit';
import fs from 'node:fs';
import path from 'node:path';
import * as print from '../../../lib/print-helper.js';
import { input, password } from '@inquirer/prompts';
import select from '@inquirer/select';
import CreateOptions from '../dto/create-options.dto.js';
import { chooseDevhub, getDefaultDevhub } from './devhub.js';
import { Org } from '@salesforce/core';
import { makeDirectory } from 'make-dir';
import ora from 'ora';

export async function initialize(options: CreateOptions): Promise<void> {
  print.header('SSDX CLI');
  const init = new initializer(options);
  init.setScratchOrgConfig();
  await init.setAlias();
  await init.chooseConfig();
  await init.verifyPackageKey();
  await init.getDevhub();
  await init.setDevhub();
}

class initializer {
  options!: CreateOptions;

  constructor(options: CreateOptions) {
    this.options = options;
    this.options.scratchOrgConfig = {
      hubOrg: {} as Org,
    };
  }

  public setScratchOrgConfig(): void {
    this.options.scratchOrgConfig.durationDays = parseInt(
      this.options.durationDays
    );
    this.options.scratchOrgConfig.wait = new Duration(
      45,
      Duration.Unit.MINUTES
    );
    this.options.scratchOrgConfig.setDefault = true;
  }

  // TODO: send inn mange Questions til prompt, for å få spørsmålene samlet
  // TODO: legg på validate-metoden på Question
  public async setAlias(): Promise<void> {
    this.options.scratchOrgName =
      this.options.scratchOrgName === undefined
        ? await input({ message: 'Enter Scratch Org name:' }) // TODO: validate input (no spaces)
        : this.options.scratchOrgName;

    this.options.scratchOrgConfig.alias = this.options.scratchOrgName;
  }

  public async chooseConfig() {
    const options: { name: string; value: string }[] = [];
    const configFolderPath = './config/';

    fs.readdirSync(configFolderPath).forEach(file => {
      const filePath = path.join(configFolderPath, file);
      if (fs.statSync(filePath).isFile()) {
        options.push({ name: file, value: file });
      }
    });

    const answer = await select({
      message: 'Select project definition file:',
      choices: options,
    });

    this.options.scratchOrgConfigPath = path.join(configFolderPath, answer);
    this.options.scratchOrgConfig.orgConfig = JSON.parse(
      fs.readFileSync(this.options.scratchOrgConfigPath, 'utf8')
    );
  }

  public async verifyPackageKey(): Promise<void> {
    await makeDirectory('.sf');
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

  public async getDevhub(): Promise<void> {
    if (this.options.targetDevHub) return;
    print.info('');
    const spinner = ora('Fetching DevHub info ...').start();
    this.options.targetDevHub =
      (await getDefaultDevhub(spinner)) || (await chooseDevhub(spinner));
  }

  public async setDevhub(): Promise<void> {
    this.options.scratchOrgConfig.hubOrg = await Org.create({
      aliasOrUsername: this.options.targetDevHub,
    });
  }
}
