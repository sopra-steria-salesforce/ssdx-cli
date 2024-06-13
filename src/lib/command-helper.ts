// import { spawn } from 'node:child_process';
import { spawn } from 'promisify-child-process';

export async function run(cmd: string, args: string[] = []): Promise<void> {
  await spawn(cmd, args, {
    stdio: 'inherit',
    shell: true,
    encoding: 'utf8',
  }).catch(error => {
    console.error(error);
    throw error;
  });
}
