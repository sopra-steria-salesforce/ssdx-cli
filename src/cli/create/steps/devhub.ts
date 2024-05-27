import { OrgList } from '../dto/org.dto.js';
import { execSync } from 'node:child_process';
import select from '@inquirer/select';
import colors from 'colors/safe.js';
import { Config } from '../dto/config.dto.js';

export function getDefaultDevhub(): string {
  const devhubUsernameOutput = execSync(
    'npx sf config:get target-dev-hub --json'
  ).toString();
  const result: Config = JSON.parse(devhubUsernameOutput);
  return result.result[0].value;
}

export async function chooseDevhub(): Promise<string> {
  const devHubOptions: { name: string; value: string }[] = getDevhubOptions();

  const devHub = await select({
    message: 'Choose DevHub:',
    choices: devHubOptions,
  });

  setDefaultDevhub(devHub);

  return devHub;
}

function getDevhubOptions(): { name: string; value: string }[] {
  const devhubList = execSync('npx sf org:list --json').toString();
  const devHubListObject = JSON.parse(devhubList) as OrgList;

  const devHubOptions: { name: string; value: string }[] = [];
  for (const devHub of devHubListObject.result.devHubs) {
    devHubOptions.push({
      name: `${colors.yellow(devHub.alias)} (${devHub.username})`,
      value: devHub.alias,
    });
  }
  return devHubOptions;
}

export function setDefaultDevhub(devhub: string): void {
  execSync('npx sf config:set target-dev-hub=' + devhub);
}
