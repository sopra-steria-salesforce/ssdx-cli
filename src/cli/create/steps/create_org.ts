// import ora from 'ora';
import * as print from '../../../lib/print-helper.js';
import CreateOptions from '../dto/create-options.dto.js';
// import { ScratchOrgCreateResult, scratchOrgCreate } from '@salesforce/core';
// import { exit } from 'node:process';
import { run } from '../../../lib/command-helper.js';

export async function createScratchOrg(options: CreateOptions): Promise<void> {
  const org = new create_org(options);
  await org.createScratchOrg();
}

class create_org {
  options: CreateOptions;

  constructor(options: CreateOptions) {
    this.options = options;
  }

  public async createScratchOrg(): Promise<void> {
    print.subheader('Create Scratch Org');

    await run('npx sf org:create:scratch', [
      '--definition-file',
      this.options.scratchOrgConfigPath,
      '--alias',
      this.options.scratchOrgName,
      '--duration-days',
      this.options.durationDays,
      '--set-default',
      '--wait',
      '45',
    ]);

    this.options.scratchOrgResult = {
      username: this.options.scratchOrgName,
      warnings: [],
    };

    // TODO: bruk scratchOrgResume for å hente ut resultatet og bruke ora

    // const spinner = ora('Creating Scratch Org').start();
    // try {
    //   this.options.scratchOrgResult = await scratchOrgCreate(
    //     this.options.scratchOrgConfig
    //   );
    //   spinner.suffixText = `(successfully created org ${this.options.scratchOrgResult.username})`;
    //   spinner.succeed();
    // } catch (error) {
    //   spinner.fail('Failed to create Scratch Org');
    //   console.error(error);
    //   exit(1);
    // }
  }
}
