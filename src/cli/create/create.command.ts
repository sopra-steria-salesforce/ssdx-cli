import { Command } from 'commander';
import CreateOptions from './dto/create-options.dto.js';
import { createScratchOrg } from './steps/create_org.js';

export default class CreateCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('create')
      .description('Create a Scratch org')
      .option(
        '-d, --duration-days <number>',
        'The amount of days to keep the Scratch Org (default: 5)',
        '5'
      )
      .option(
        '-n, --scratch-org-name <string>',
        'The local name of the Scratch Org'
      )
      .action((options: CreateOptions) => {
        void createScratchOrg(options);
      });
  }
}
