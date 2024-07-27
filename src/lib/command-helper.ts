import { spawn } from 'promisify-child-process';
import * as print from './print-helper.js';
import ora, { Ora } from 'ora';
import { Color, setColor } from './print-helper/print-helper-formatter.js';
import { exit } from 'process';
import { logger, loggerError, loggerInfo } from './log.js';
import pino from 'pino';
import { StdioOptions } from 'node:child_process';

export async function run(options: CmdOption): Promise<CmdResult> {
  const cmd = new Command(options);
  await cmd.run();
  return cmd.output;
}

export class Command {
  child;
  output: CmdResult = { stdout: [], stderr: [], code: 0 };
  spinner?: Ora;
  options: CmdOption;

  constructor(options: CmdOption) {
    this.options = options;
    this.child = spawn(this.cmd, this.args, {
      stdio: this.stdio,
      shell: true,
      encoding: 'utf8',
      env: {
        ...process.env,
        SF_CAPITALIZE_RECORD_TYPES: 'true',
        FORCE_SHOW_SPINNER: 'true',
        SF_SKIP_NEW_VERSION_CHECK: 'true',
      },
    });

    this.startSpinner();
    this.printHeader();
    this.printSeparator();
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
  get showHeader(): boolean {
    return this.typeIs(OutputType.OutputLiveWithHeader);
  }
  get showSpinner(): boolean {
    return (
      this.typeIs(OutputType.Spinner) ||
      this.typeIs(OutputType.SpinnerAndOutput)
    );
  }
  get showInitialSeparator(): boolean {
    return this.typeIs(OutputType.OutputLiveWithHeader);
  }
  get showEndSeparator(): boolean {
    return (
      this.typeIs(OutputType.OutputEnd) ||
      this.typeIs(OutputType.SpinnerAndOutput)
    );
  }
  // TODO: implement retry
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
    return (
      this.typeIs(OutputType.OutputEnd) ||
      this.typeIs(OutputType.OutputLiveWithHeader) ||
      this.typeIs(OutputType.SpinnerAndOutput) // TODO missing separator
    );
  }
  get liveOutput(): boolean {
    return (
      this.typeIs(OutputType.OutputLive) ||
      this.typeIs(OutputType.OutputLiveWithHeader)
    );
  }
  get customPipeOutput(): boolean {
    return this.typeIs(OutputType.OutputLiveAndClear);
  }
  get shouldClearOutput(): boolean {
    return this.typeIs(OutputType.OutputLiveAndClear);
  }

  /* -------------------------------------------------------------------------- */
  /*                                 run command                                */
  /* -------------------------------------------------------------------------- */
  private startSpinner() {
    if (this.showSpinner) {
      this.spinner = ora(this.spinnerText).start();
    }
  }
  private printHeader() {
    if (this.showHeader) {
      print.info(this.spinnerText, false);
    }
  }
  private printSeparator() {
    if (this.showInitialSeparator) {
      print.printSeparator();
    }
  }

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
    const o = this.output;
    this.child.stdout?.on('data', data => this.store(data, o.stdout, fn));
  }
  private handleStderr() {
    const fn = loggerError;
    const o = this.output;
    this.child.stderr?.on('data', data => this.store(data, o.stderr, fn));
  }
  private store(data: any, output: string[], loggerMethod: pino.LogFn) {
    const dataBuf: Buffer = data;
    const dataStr = dataBuf.toString().trimEnd() + '\n';
    if (dataStr !== '\n') {
      loggerMethod(dataStr);
      output.push(dataStr);
    }
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
        logger.error(error);
      });
  }
  private spinnerError() {
    if (!this.showSpinner) return;

    if (this.spinner?.isSpinning) {
      this.spinner.suffixText =
        '... ERROR! See message below:\n' +
        print.getSeparator() +
        '\n' +
        setColor(this.output.stdout.join('\n'), Color.red) +
        '\n\n';
      this.spinner.fail();
    }

    if (this.exitOnError) exit(1);
  }
  private printError() {
    if (!this.outputError || this.showSpinner) return;
    print.error('\nERROR! See message below:\n', false);
    print.error(this.output.stdout.join('\n') + '\n', false);

    if (this.exitOnError) exit(1);
  }
  // TODO: calculate the real amount when process.stdout.col is less then a strings width
  // TODO: get output from native pipe to clear
  private clearOutput() {
    if (this.shouldClearOutput) {
      const lines = this.getLinesOfOutput();
      this.clearNLines(lines);
    }
  }
  private getLinesOfOutput() {
    let lines = 0;
    // iterate all output and errors
    for (const line of [...this.output.stdout, ...this.output.stderr]) {
      // split on newline
      for (const split of line.split('\n')) {
        // if split is empty, add 1 line due empty newline
        lines += Math.ceil(split.length / process.stdout.columns) || 1;
      }
    }
    return lines;
  }
  private clearNLines(N: number): void {
    process.stdout.moveCursor(0, -N);
    process.stdout.clearScreenDown();
  }

  private clearSpinner() {
    if (this.spinner?.isSpinning) this.spinner.succeed();
  }
  private printOutput() {
    if (this.showEndSeparator) print.printSeparator();
    if (this.endOutput && this.output.code === 0) {
      print.info(this.output.stdout.join('\n') + '\n', false);
    }
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
  OutputLiveWithHeader,
  OutputLiveAndClear,
  Spinner,
  SpinnerAndOutput,
}

export interface CmdResult {
  stdout: string[];
  stderr: string[];
  code: number;
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
    print.error('Error running command:', false);
    print.code(`${cmd} ${args.join(' ')}`, false);
    throw error;
  });

  return output.stdout as string;
}
