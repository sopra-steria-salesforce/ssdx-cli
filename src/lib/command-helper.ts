import { spawn } from 'promisify-child-process';
import * as print from './print-helper.js';
import ora, { Ora } from 'ora';
import { Color, setColor } from './print-helper/print-helper-formatter.js';
import { exit } from 'process';
import { logger, loggerError, loggerInfo } from './log.js';
import pino from 'pino';
import { StdioOptions } from 'node:child_process';

// TODO: implement default spinner
// TODO: implement retry on error

export async function run(options: CmdOption): Promise<CmdResult> {
  const cmd = new Command(options);
  await cmd.run();
  return cmd.output;
}

export class Command {
  child;
  output: CmdResult = { stdout: '', stderr: '', code: 0 };
  spinner?: Ora;
  options: CmdOption;

  constructor(options: CmdOption) {
    this.options = options;
    this.child = spawn(this.cmd, this.args, {
      stdio: this.stdio,
      shell: true,
      encoding: 'utf8',
    });

    if (this.showSpinner) this.spinner = ora(this.spinnerText).start();
  }

  /* -------------------------------------------------------------------------- */
  /*                                   getters                                  */
  /* -------------------------------------------------------------------------- */

  private get cmd(): string {
    return this.options.cmd;
  }
  private get args(): string[] {
    return this.options.args ?? [];
  }
  get stdio(): StdioOptions {
    return this.liveOutput ? 'inherit' : 'pipe'; // liveOutput = true means inheritting the showing the output natively, else use custom piping
  }
  private get spinnerText() {
    return this.options.spinnerText ?? this.options.cmd;
  }
  get showSpinner(): boolean {
    return this.typeIs(OutputType.Spinner);
  }
  // TODO: implement
  private get retryOnFailure(): boolean {
    return this.options.retryOnFailure ?? false;
  }
  private get outputType(): OutputType {
    return this.options.outputType ?? OutputType.Silent;
  }
  private typeIs(type: OutputType): boolean {
    return this.outputType == type;
  }
  private get outputError(): boolean {
    if (this.outputType === OutputType.Silent) return false;
    return this.options.outputError ?? true; // if outputError is undefined, default to true. If false, returns false.
  }
  private get exitOnError(): boolean {
    return this.options.exitOnError ?? true;
  }
  get isSilent(): boolean {
    return this.typeIs(OutputType.Silent);
  }
  get endOutput(): boolean {
    return this.typeIs(OutputType.OutputEnd);
  }
  get liveOutput(): boolean {
    return (
      this.typeIs(OutputType.OutputLive) ||
      this.typeIs(OutputType.OutputLiveAndClear)
    );
  }
  get customPipeOutput(): boolean {
    return (
      this.typeIs(OutputType.OutputLivePipe) ||
      this.typeIs(OutputType.OutputLiveAndClearPipe)
    );
  }
  get shouldClearOutput(): boolean {
    return (
      this.typeIs(OutputType.OutputLiveAndClear) ||
      this.typeIs(OutputType.OutputLiveAndClearPipe)
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                 run command                                */
  /* -------------------------------------------------------------------------- */

  public async run(): Promise<void> {
    this.pipeStdout();
    this.storeStdout();
    this.handleStderr();
    await this.runCmd();
    this.clearOutput();
    this.clearSpinner();
    this.printOutput();
  }
  private pipeStdout() {
    if (this.customPipeOutput) this.child.stdout?.pipe(process.stdout);
  }
  private storeStdout() {
    const fn = loggerInfo;
    const out = this.output;
    this.child.stdout?.on('data', data => (out.stdout += this.store(data, fn)));
  }
  private handleStderr() {
    const fn = loggerError;
    const out = this.output;
    this.child.stderr?.on('data', data => (out.stderr += this.store(data, fn)));
  }
  private store(data: any, loggerMethod: pino.LogFn): string {
    const dataBuf: Buffer = data;
    const dataStr = dataBuf.toString();
    loggerMethod(dataStr);
    return dataStr;
  }

  private async runCmd() {
    logger.info(`Running command: ${this.cmd} ${this.args.join(' ')}`);
    await this.child
      .on('exit', code => {
        this.output.code = code as number;
        if (this.output.code !== 0) {
          this.spinnerError();
          this.printError();
        }
      })
      .catch(error => {
        logger.error(
          'Caught Spawn Error, continuing if not specified exitOnError. See error:'
        );
        logger.error(error);
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

    print.error('\n\nERROR RUNNING CODE:');
    print.code(this.cmd + ' ' + this.args.join(' '));
    print.error('\nERROR MESSAGE:');
    print.error(this.output.stdout);
    if (this.exitOnError) exit(0);
  }
  private clearOutput() {
    if (this.shouldClearOutput) {
      const lines = this.output.stdout.split(/\r\n|\r|\n/).length;
      clearNLines(lines);
    }
  }
  private clearSpinner() {
    if (this.spinner?.isSpinning) this.spinner.succeed();
  }
  private printOutput() {
    if (this.endOutput) print.info(this.output.stdout);
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
  OutputLivePipe,
  OutputLiveAndClearPipe,
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
