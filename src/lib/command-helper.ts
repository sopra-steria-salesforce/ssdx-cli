import { spawn } from 'promisify-child-process';
import * as print from './print-helper.js';
import { exit } from 'process';

export async function run(
  cmd: string,
  args: string[] = [],
  outputSettings: Output = Output.Supressed
): Promise<Result> {
  const settings = getOutputMethod(outputSettings);
  const child = spawn(cmd, args, {
    shell: true,
    encoding: 'utf8',
  });

  // print output during run
  if (settings && settings.printOutput)
    child.stdout && child.stdout.pipe(process.stdout);

  // run cmd
  const output = await child.catch(error => {
    print.error('\n\nERROR RUNNING CODE:');
    print.code(cmd + ' ' + args.join(' '));
    print.error('\nERROR MESSAGE:');
    print.error(error as string);
    exit(1);
  });

  if (settings && settings.clearOutput) clearOutput(output.stdout as string);

  return {
    stdout: output.stdout as string,
    stderr: output.stderr as string,
    code: output.code as number,
  };
}

export enum Output {
  Supressed,
  Live,
  LiveAndClear,
}

export interface OutputMethod {
  printOutput: boolean;
  printError: boolean;
  clearOutput: boolean;
}

function getOutputMethod(type?: Output): OutputMethod {
  switch (type) {
    default:
    case Output.Supressed:
      return { printOutput: false, printError: false, clearOutput: false };
    case Output.Live:
      return { printOutput: true, printError: true, clearOutput: false };
    case Output.LiveAndClear:
      return { printOutput: true, printError: true, clearOutput: true };
  }
}

export interface Result {
  stdout: string;
  stderr: string;
  code: number;
}

function clearOutput(output: string): void {
  const lines = output.split(/\r\n|\r|\n/).length;
  clearLastLines(lines);
}

function clearLastLines(count: number): void {
  process.stdout.moveCursor(0, -count);
  process.stdout.clearScreenDown();
}

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
