import { Command } from 'commander';
import ApexCommand from './apex/apex.command.js';
import JsCommand from './js/js.command.js';
import SlotOption from '../../dto/ssdx-config-slot.dto.js';
import * as apex from './apex/apex.command.js';
import * as js from './js/js.command.js';

export default class ScriptCommand {
  program: Command;
  apexCmd: ApexCommand;
  jsCmd: JsCommand;

  constructor(program: Command) {
    this.program = program;
    this.apexCmd = new ApexCommand(this.program);
    this.jsCmd = new JsCommand(this.program);

    this.program
      .command('script')
      .description('Run Apex and js scripts defined in ssdx-config.json')
      .option('--init', 'Runs before dependencies', false)
      .option('--pre_deploy', 'Runs before deployment', false)
      .option('--post_deploy', 'Runs after deployment', false)
      .action((options: SlotOption) => {
        void runScripts(options);
      });
  }
}

export async function runScripts(options: SlotOption) {
  await apex.runScript(options);
  await js.runScripts(options);
}
