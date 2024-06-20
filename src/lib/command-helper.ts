import { spawn } from 'promisify-child-process';
import * as print from './print-helper.js';

export async function run(cmd: string, args: string[] = []): Promise<void> {
  await spawn(cmd, args, {
    stdio: 'inherit',
    shell: true,
    encoding: 'utf8',
  }).catch(error => {
    print.error('Error running command:');
    print.code(`${cmd} ${args.join(' ')}`);
    throw error;
  });
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
