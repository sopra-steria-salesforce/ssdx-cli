import ora from 'ora';
import * as print from '../../../lib/print-helper.js';
import CreateOptions from '../dto/create-options.dto.js';
import { scratchOrgCreate } from '@salesforce/core';
import { exit } from 'node:process';

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
    print.header('Create Scratch Org');
    const spinner = ora('Creating Scratch Org').start();
    // this.options.scratchOrgUsername = 'elba3'; // TODO: remove this line
    // spinner.succeed();
    // return;
    try {
      this.options.scratchOrgResult = await scratchOrgCreate(
        this.options.scratchOrgConfig
      );
      spinner.suffixText = `(successfully created org ${this.options.scratchOrgResult.username})`;
      spinner.succeed();
    } catch (error) {
      spinner.fail('Failed to create Scratch Org');
      console.error(error);
      exit(1);
    }
  }
}
