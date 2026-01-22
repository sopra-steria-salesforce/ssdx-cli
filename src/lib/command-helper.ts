import { spawn } from 'promisify-child-process';
import * as print from './print-helper.js';
import ora, { Ora } from 'ora';
import { Color, setColor } from './print-helper/print-helper-formatter.js';
import { exit } from 'process';
import { logger, loggerError, loggerInfo } from './log.js';
import pino from 'pino';
import { StdioOptions } from 'node:child_process';
import { handleProcessSignals } from './process.js';
import BaseOptions from 'dto/base.dto.js';

export async function run(options: CmdOption): Promise<CmdResult> {
  const cmd = new Command(options);
  await cmd.run();
  return cmd.output;
}

export interface CmdOption {
  cmd: string;
  args?: string[];
  outputType?: OutputType;
  spinnerText?: string;
  spinnerErrorText?: string;
  retryOnFailure?: boolean;
  exitOnError?: boolean;
  outputError?: boolean;
}

export enum OutputType {
  Silent,
  OutputEnd,
  OutputLive,
  OutputLiveWithHeader,
  Spinner,
  SpinnerAndOutput,
}

export interface CmdResult {
  stdout: string[];
  stderr: string[];
  code: number;
}

/* -------------------------------------------------------------------------- */
/*                                  Cmd Class                                 */
/* -------------------------------------------------------------------------- */

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
  private get defaultSpinnerErrorText() {
    return (
      'ERROR! See message below:\n' +
      print.getSeparator() +
      '\n' +
      setColor(this.output.stdout.join('\n'), Color.red) +
      '\n\n'
    );
  }
  private get spinnerErrorText() {
    return this.options.spinnerErrorText ?? this.defaultSpinnerErrorText;
  }

  get showHeader(): boolean {
    return this.typeIs(OutputType.OutputLiveWithHeader);
  }

  get showSpinner(): boolean {
    return this.typeIs(OutputType.Spinner) || this.typeIs(OutputType.SpinnerAndOutput);
  }

  get showInitialSeparator(): boolean {
    return this.typeIs(OutputType.OutputLiveWithHeader);
  }

  get showEndSeparator(): boolean {
    return this.typeIs(OutputType.OutputEnd) || this.typeIs(OutputType.SpinnerAndOutput);
  }

  // TODO: implement retry
  private get retryOnFailure(): boolean {
    return this.options.retryOnFailure ?? false;
  }

  private get outputType(): OutputType {
    return BaseOptions.ci ? OutputType.OutputLiveWithHeader : (this.options.outputType ?? OutputType.Silent);
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
    return this.typeIs(OutputType.OutputLive) || this.typeIs(OutputType.OutputLiveWithHeader);
  }

  /* -------------------------------------------------------------------------- */
  /*                                   spinner                                  */
  /* -------------------------------------------------------------------------- */

  private startSpinner() {
    if (this.showSpinner) {
      this.spinner = ora(this.spinnerText).start();
      handleProcessSignals(this.spinner);
    }
  }

  private printHeader() {
    if (this.showHeader) {
      print.output(this.spinnerText);
    }
  }

  private printSeparator() {
    if (this.showInitialSeparator) {
      print.printSeparator();
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                 run command                                */
  /* -------------------------------------------------------------------------- */

  public async run(): Promise<void> {
    this.storeStdout();
    this.storeStderr();
    await this.runCmd();
    this.handleError();
    this.clearSpinner();
    this.printOutput();
  }

  private storeStdout() {
    this.child.stdout?.on('data', data => this.store(data, this.output.stdout, loggerInfo));
  }

  private storeStderr() {
    this.child.stderr?.on('data', data => this.store(data, this.output.stderr, loggerError));
  }

  // store stdout amd stderr, with correct newlines
  private store(data: any, output: string[], loggerMethod: pino.LogFn) {
    const dataBuf: Buffer = data;
    const dataStr = dataBuf.toString().trimEnd() + '\n';
    if (dataStr !== '\n') {
      loggerMethod(dataStr);
      output.push(dataStr);
    }
  }

  private async runCmd() {
    print.debug(`Running command: ${this.cmd} ${this.args.join(' ')}`);

    // prettier-ignore
    await this.child
      .on('exit', code => (this.output.code = code as number))
      .catch(error => logger.error(error));
  }

  private handleError() {
    if (this.output.code !== 0) {
      this.spinnerError();
      this.printError();
    }
  }

  private clearSpinner() {
    if (this.spinner?.isSpinning) this.spinner.succeed();
  }

  private printOutput() {
    if (this.showEndSeparator) print.printSeparator();
    if (this.endOutput && this.output.code === 0) {
      print.output(this.output.stdout.join('\n') + '\n');
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                Error Handler                               */
  /* -------------------------------------------------------------------------- */

  private spinnerError() {
    if (!this.showSpinner) return;

    if (this.spinner?.isSpinning) {
      this.spinner.suffixText = `... ${this.spinnerErrorText}`;
      this.spinner.fail();
    }

    if (this.exitOnError) exit(1);
  }

  private printError() {
    if (!this.outputError || this.showSpinner) return;
    print.error('\nERROR! See message below:\n');
    print.error(this.output.stdout.join('\n') + '\n');

    if (this.exitOnError) exit(1);
  }
}
