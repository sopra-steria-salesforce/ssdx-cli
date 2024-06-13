import { spawn } from 'promisify-child-process';
import * as print from './print-helper.js';

export async function run(cmd: string, args: string[] = []): Promise<void> {
  await spawn(cmd, args, {
    stdio: 'inherit',
    shell: true,
    encoding: 'utf8',
  }).catch(error => {
    print.error('Error running command:');

    throw error;
  });
}
