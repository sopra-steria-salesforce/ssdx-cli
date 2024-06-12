import { spawn } from 'node:child_process';

export function run(cmd: string): void {
  const [command, ...args] = cmd.split(' ');

  const childProcess = spawn(command, args, { stdio: 'inherit' });

  childProcess.on('error', error => {
    console.error(`Failed to run command: ${cmd}`);
    console.error(error);
  });

  childProcess.on('exit', code => {
    if (code !== 0) {
      console.error(`Command exited with code ${code}: ${cmd}`);
    }
  });
}
