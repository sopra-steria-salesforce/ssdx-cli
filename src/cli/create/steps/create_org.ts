import ora, { Ora } from 'ora';
import * as print from 'lib/print-helper.js';
import CreateOptions from '../dto/create-options.dto.js';
// import { ScratchOrgCreateResult, scratchOrgCreate } from '@salesforce/core';
// import { exit } from 'node:process';
import { OutputType, run } from 'lib/command-helper.js';
import { Org } from '../dto/org.dto.js';

export async function createScratchOrg(options: CreateOptions): Promise<void> {
  const org = new create_org(options);
  await org.createScratchOrg();
  await org.fetchUsername();
}

class create_org {
  options: CreateOptions;
  spinner!: Ora;
  constructor(options: CreateOptions) {
    this.options = options;
  }

  public async createScratchOrg(): Promise<void> {
    print.subheader('Create Scratch Org');

    this.spinner = ora('Creating Scratch Org').start();

    await run({
      cmd: 'npx sf org:create:scratch',
      args: [
        '--definition-file',
        this.options.configFile,
        '--alias',
        this.options.scratchOrgName,
        '--duration-days',
        this.options.durationDays,
        '--set-default',
        '--wait',
        '45',
      ],
      outputType: OutputType.OutputLiveAndClear,
    }); // TODO: add Output.LiveAndClear (bug, output wont appear)

    this.options.scratchOrgResult = {
      username: this.options.scratchOrgName,
      warnings: [],
    };
  }

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

  public async fetchUsername(): Promise<void> {
    // console.log('');

    const { stdout } = await run({
      cmd: 'npx sf org:display',
      args: ['--target-org', this.options.scratchOrgName, '--json'],
    });

    const org: Org = stdout && JSON.parse(stdout);
    this.spinner.suffixText = `(username: ${org.result.username})`;
    this.spinner.succeed();
  }
}
