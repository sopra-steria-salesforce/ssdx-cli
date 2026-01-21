import { Duration } from '@salesforce/kit';
import fs from 'node:fs';
import path from 'node:path';
import * as print from 'lib/print-helper.js';
import { input, password } from '@inquirer/prompts';
import select from '@inquirer/select';
import CreateOptions from '../create.dto.js';
import { chooseDevhub } from './devhub.js';
import { Org } from '@salesforce/core';
import { makeDirectory } from 'make-dir';
import { getCurrentDevHubAlias } from 'lib/config/sf-config.js';
import { fetchConfig, SSDX } from 'lib/config/ssdx-config.js';

const CONFIG_FOLDER_PATH = './config/';

export async function initialize(): Promise<void> {
  print.subheader('Scratch Org');

  const init = new initializer();
  init.setScratchOrgConfig();
  await init.setAlias();
  await init.chooseConfig();
  init.setConfig();
  await init.verifyPackageKey();
  await init.getDevhub();
  await init.setDevhub(); // ask to save as default for repo
}

class initializer {
  options!: CreateOptions;
  ssdxConfig!: SSDX;

  constructor() {
    this.ssdxConfig = fetchConfig();
    CreateOptions.scratchOrgConfig = {
      hubOrg: {} as Org,
    };
  }

  public setScratchOrgConfig(): void {
    CreateOptions.scratchOrgConfig.durationDays = parseInt(CreateOptions.durationDays);
    CreateOptions.scratchOrgConfig.wait = new Duration(45, Duration.Unit.MINUTES);
    CreateOptions.scratchOrgConfig.setDefault = true;
  }

  // TODO: send inn mange Questions til prompt, for å få spørsmålene samlet
  // TODO: legg på validate-metoden på Question
  public async setAlias(): Promise<void> {
    CreateOptions.scratchOrgName =
      CreateOptions.scratchOrgName === undefined
        ? await input({ message: 'Enter Scratch Org name:' }) // TODO: validate input (no spaces)
        : CreateOptions.scratchOrgName;

    CreateOptions.scratchOrgConfig.alias = CreateOptions.scratchOrgName;
  }

  public async chooseConfig() {
    if (CreateOptions.configFile) {
      return;
    } else if (this.ssdxConfig.config.default_config) {
      CreateOptions.configFile = this.ssdxConfig.config.default_config;
    } else {
      await this.configDecision();
    }
  }

  private async configDecision(): Promise<void> {
    const options: { name: string; value: string }[] = [];

    fs.readdirSync(CONFIG_FOLDER_PATH).forEach(file => {
      const filePath = path.join(CONFIG_FOLDER_PATH, file);
      if (fs.statSync(filePath).isFile()) {
        options.push({ name: file, value: file });
      }
    });

    const answer = await select({
      message: 'Select project definition file:',
      choices: options,
    });

    CreateOptions.configFile = path.join(CONFIG_FOLDER_PATH, answer);
  }

  public setConfig() {
    CreateOptions.scratchOrgConfig.orgConfig = JSON.parse(fs.readFileSync(CreateOptions.configFile, 'utf8'));
  }

  public async verifyPackageKey(): Promise<void> {
    await makeDirectory('.sf');
    const packageKeyPath = './.sf/package.key';
    if (fs.existsSync(packageKeyPath)) {
      CreateOptions.packageKey = fs.readFileSync(packageKeyPath, 'utf8');
    } else {
      CreateOptions.packageKey = await password({
        message: 'Enter package key:',
      });
      fs.writeFileSync(packageKeyPath, CreateOptions.packageKey);
    }
  }

  public async getDevhub(): Promise<void> {
    if (CreateOptions.targetDevHub) return;
    CreateOptions.targetDevHub = (await getCurrentDevHubAlias()) || (await chooseDevhub());
  }

  public async setDevhub(): Promise<void> {
    CreateOptions.scratchOrgConfig.hubOrg = await Org.create({
      aliasOrUsername: CreateOptions.targetDevHub,
    });
  }
}
