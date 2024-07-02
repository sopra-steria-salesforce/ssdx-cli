import { spawn } from 'promisify-child-process';
import * as print from './print-helper.js';
import ora, { Ora } from 'ora';
import { Color, setColor } from './print-helper/print-helper-formatter.js';
import { exit } from 'process';
import { logger } from './log.js';

// TODO: implement default spinner
// TODO: implement retry on error

export async function run(options: CmdOption): Promise<CmdResult> {
  const cmd = new Command(options);
  await cmd.run();
  return cmd.output;
}

export class Command {
  cmd: string;
  args: string[];
  child;
  output: CmdResult = { stdout: '', stderr: '', code: 0 };
  outputType: OutputType;
  spinner?: Ora;
  spinnerText: string;
  retryOnFailure?: boolean;
  outputError: boolean;
  exitOnError: boolean;

  constructor(options: CmdOption) {
    logger.info('Creating new command instance');
    this.cmd = options.cmd;
    this.args = options.args ?? [];
    this.child = spawn(this.cmd, this.args, {
      shell: true,
      encoding: 'utf8',
    });
    this.outputType = options.outputType ?? OutputType.Silent;
    this.retryOnFailure = options.retryOnFailure;
    this.outputError = options.outputError ?? true;
    this.exitOnError = options.exitOnError ?? true;

    // spinner
    this.spinnerText = options.spinnerText ?? this.cmd;
    if (this.showSpinner) this.spinner = ora(this.spinnerText).start();
  }

  /* -------------------------------------------------------------------------- */
  /*                                 run command                                */
  /* -------------------------------------------------------------------------- */

  public async run(): Promise<void> {
    this.handleStdout();
    this.handleStderr();
    await this.runCmd();
    this.clearOutput();
    this.clearSpinner();
  }
  private handleStdout() {
    if (this.liveOutput) {
      this.child.stdout?.pipe(process.stdout);
    }
    this.child.stdout?.on('data', data => {
      const dataStr: Buffer = data;
      this.output.stdout += dataStr.toString();
      logger.info(dataStr.toString());
    });
  }
  private async runCmd() {
    logger.info(`Running command: ${this.cmd} ${this.args.join(' ')}`);
    await this.child.on('exit', code => {
      if ((code as number) !== 0) {
        this.spinnerError();
        this.printError();
      }
    });
  }
  private handleStderr() {
    this.child.stderr?.on('data', data => {
      const dataStr: Buffer = data;
      logger.error(dataStr.toString());
      this.output.stderr += dataStr.toString();
    });
  }
  private spinnerError() {
    if (!this.showSpinner) return;

    if (this.spinner?.isSpinning) {
      this.spinner.suffixText = '\n' + setColor(this.output.stdout, Color.red);
      this.spinner.fail();
    }

    if (this.exitOnError) exit(0);
  }
  private printError() {
    if (!this.outputError || this.showSpinner) return;

    console.log('ERROR RUNNING CODE:');
    print.error('\n\nERROR RUNNING CODE:');
    print.code(this.cmd + ' ' + this.args.join(' '));
    print.error('\nERROR MESSAGE:');
    print.error(this.output.stdout);
    if (this.exitOnError) exit(0);
  }
  private clearOutput() {
    if (this.shouldClearOutput) {
      logger.info('Clearing output');
      const lines = this.output.stdout.split(/\r\n|\r|\n/).length;
      clearNLines(lines);
    }
  }
  private clearSpinner() {
    logger.info('Clearing spinner');
    if (this.spinner?.isSpinning) this.spinner.succeed();
  }

  /* -------------------------------------------------------------------------- */
  /*                                   getters                                  */
  /* -------------------------------------------------------------------------- */

  get isSilent(): boolean {
    return this.outputType == OutputType.Silent;
  }
  get endOutput(): boolean {
    return this.outputType == OutputType.OutputEnd;
  }
  get liveOutput(): boolean {
    return (
      this.outputType === OutputType.OutputLive ||
      this.outputType === OutputType.OutputLiveAndClear
    );
  }
  get shouldClearOutput(): boolean {
    return this.outputType == OutputType.OutputLiveAndClear;
  }
  get showSpinner(): boolean {
    return this.outputType == OutputType.Spinner;
  }
}

export interface CmdOption {
  cmd: string;
  args?: string[];
  outputType?: OutputType;
  spinnerText?: string;
  retryOnFailure?: boolean;
  exitOnError?: boolean;
  outputError?: boolean;
}

export enum OutputType {
  Silent,
  OutputEnd,
  OutputLive,
  OutputLiveAndClear,
  Spinner,
}

export interface CmdResult {
  stdout: string;
  stderr: string;
  code: number;
}

function clearNLines(N: number): void {
  process.stdout.moveCursor(0, -N);
  process.stdout.clearScreenDown();
}

// TODO: move to new method

export async function runCmd(
  cmd: string,
  args: string[] = []
): Promise<string> {
  const output = await spawn(cmd, args, {
    shell: true,
    encoding: 'utf8',
  }).catch(error => {
    print.error('Error running command:');
    print.code(`${cmd} ${args.join(' ')}`);
    throw error;
  });

  return output.stdout as string;
}
