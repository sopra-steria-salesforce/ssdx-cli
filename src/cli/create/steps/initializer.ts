import { Duration } from '@salesforce/kit';
import fs from 'node:fs';
import path from 'node:path';
import * as print from 'lib/print-helper.js';
import { input, password } from '@inquirer/prompts';
import select from '@inquirer/select';
import CreateOptions from '../dto/create-options.dto.js';
import { chooseDevhub, getDefaultDevhub } from './devhub.js';
import { Org } from '@salesforce/core';
import { makeDirectory } from 'make-dir';
import ora from 'ora';
import * as ssdx from 'lib/config/ssdx-config.js';

const CONFIG_FOLDER_PATH = './config/';

export async function initialize(options: CreateOptions): Promise<void> {
  print.header('SSDX CLI');
  const init = new initializer(options);
  init.setScratchOrgConfig();
  init.setSsdxConfig();
  await init.setAlias();
  // TODO: ask to delete previous
  await init.chooseConfig();
  init.setConfig();
  await init.verifyPackageKey();
  await init.getDevhub();
  await init.setDevhub(); // ask to save as default for repo
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

  public setSsdxConfig(): void {
    this.options.ssdxConfig = ssdx.fetchConfig();
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
    if (this.options.configFile) {
      return;
    } else if (this.options.ssdxConfig.default_config) {
      this.options.configFile = this.options.ssdxConfig.default_config;
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

    this.options.configFile = path.join(CONFIG_FOLDER_PATH, answer);
  }

  public setConfig() {
    this.options.scratchOrgConfig.orgConfig = JSON.parse(
      fs.readFileSync(this.options.configFile, 'utf8')
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
    const spinner = ora('Fetching DevHub info ...').start(); // TODO: print the devhub used
    this.options.targetDevHub =
      (await getDefaultDevhub(spinner)) || (await chooseDevhub(spinner));
  }

  public async setDevhub(): Promise<void> {
    this.options.scratchOrgConfig.hubOrg = await Org.create({
      aliasOrUsername: this.options.targetDevHub,
    });
  }
}
