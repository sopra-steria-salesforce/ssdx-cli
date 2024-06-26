import { OrgList } from '../dto/orgs.dto.js';
import { execSync } from 'node:child_process';
import select from '@inquirer/select';
import colors from 'colors/safe.js';
import { Config } from '../dto/create-config.dto.js';
import { runCmd } from '../../../lib/command-helper.js';
import { Ora } from 'ora';

// TODO: change to native query method
/*
async function getConnection() {
	return (
		await core.Org.create({
			aliasOrUsername: TARGET_ORG
		})
	).getConnection();
}

async function queryRecord(query) {
	const conn = await getConnection();
	return (await conn.query(query)).records[0].Id;
}

*/

export async function getDefaultOrg(): Promise<string> {
  const targetOrgOutput = await runCmd('npx sf config:get target-org --json');
  const result: Config = JSON.parse(targetOrgOutput);
  return result.result[0].value;
}

export async function getDefaultDevhub(spinner: Ora): Promise<string> {
  const devhubUsernameOutput = await runCmd(
    'npx sf config:get target-dev-hub --json'
  );
  const result: Config = JSON.parse(devhubUsernameOutput);
  const devHub = result.result[0].value;
  if (devHub) spinner.succeed();
  return devHub;
}

export async function chooseDevhub(spinner: Ora): Promise<string> {
  const devHubOptions: { name: string; value: string }[] =
    await getDevhubOptions();
  spinner.succeed();

  const devHub = await select({
    message: 'Choose DevHub:',
    choices: devHubOptions,
  });

  setDefaultDevhub(devHub);

  return devHub;
}

interface devHubOption {
  name: string;
  value: string;
}

async function getDevhubOptions(): Promise<devHubOption[]> {
  const devhubList = await runCmd('npx sf org:list --json');
  const devHubListObject = JSON.parse(devhubList) as OrgList;

  const devHubOptions: devHubOption[] = [];

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
