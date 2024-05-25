import { Command } from 'commander';
import CreateOptions from './dto/create-options.dto';

export function createScratchOrg(options: CreateOptions): void {
  console.log('Create Scratch Org');
  console.log(`Name: ${options.scratchOrgName}`);
  console.log(`days: ${options.durationDays}`);
}

class CreateCommand {
  program: Command;
  constructor(program: Command) {
    this.program = program;

    this.program
      .command('create')
      .description('Create a Scratch org')
      .option(
        '-d, --duration-days <number>',
        'The amount of days to keep the Scratch Org (default: 5)',
        '5'
      )
      .option(
        '-n, --scratch-org-name <string>',
        'The local name of the Scratch Org'
      )
      .action((options: CreateOptions) => {
        createScratchOrg(options);
      });
  }
}

export default CreateCommand;

// import { execSync } from 'child_process';

// const C = '\x1b[1;33m';
// const RED = '\x1b[1;31m';
// const YELLOW = '\x1b[0;33m';
// const BLUE = '\x1b[1;34m';
// const NC = '\x1b[0m'; // No Color

// // SET ENV VARIABLES
// ///////////////////////////////////////////////////////////////////////////
// process.env.SF_SKIP_NEW_VERSION_CHECK = 'true';
// process.env.FORCE_SHOW_SPINNER = 'true';
// process.env.SF_CAPITALIZE_RECORD_TYPES = 'true';

// function displayCenter(text: string) {
//   const columns = process.stdout.columns;
//   const formattedText = text.replace(/(.{1,columns})/g, '$1\n');
//   console.log(formattedText);
// }

// function printHeader(text: string) {
//   console.log(`${C}\n\n`);
//   console.log(`${'-'.repeat(process.stdout.columns || 80)}`);
//   displayCenter(text);
//   console.log(`${'-'.repeat(process.stdout.columns || 80)}`);
//   console.log(`${NC}`);
// }

// // CHECK DEVHUB
// ///////////////////////////////////////////////////////////////////////////
// function authDevhub() {
//   console.log(`\n${YELLOW}Set a DevHub alias:${NC}`);
//   const DEVHUB = readlineSync.question('Alias: ');
//   execSync(`npm run auth:devhub ${DEVHUB}`, { stdio: 'inherit' });
// }

// function chooseDevhub() {
//   console.log('');
//   const orgListOutput = execSync('npx sf org:list --json').toString();
//   const orgList = JSON.parse(orgListOutput);
//   const headers = ['Alias', 'Username', 'Instance', 'Status'];
//   const separator = headers.map(() => '-'.repeat(10));
//   const rows = orgList.result.devHubs.map((org: any) => [
//     org.alias,
//     org.username,
//     org.instanceUrl,
//     org.connectedStatus,
//   ]);
//   const table = [headers, separator, ...rows];
//   console.log(tableToString(table, '\t'));

//   console.log(`\n${YELLOW}Choose a DevHub (production login):${NC}`);
//   const DEVHUB = readlineSync.question('Alias: ');
//   console.log('');
//   execSync(`npx sf config:set target-dev-hub=${DEVHUB}`, { stdio: 'inherit' });
// }

// function devhubLogin() {
//   console.log(
//     `\n${RED}DevHub not authenticated. Do one of the following:${NC}`
//   );

//   const options = [
//     'Authenticate DevHub (by logging into production)',
//     'Choose existing DevHub',
//   ];
//   const index = readlineSync.keyInSelect(options, 'Select an option:');
//   switch (index) {
//     case 0:
//       authDevhub();
//       break;
//     case 1:
//       chooseDevhub();
//       break;
//     default:
//       break;
//   }
// }

// const devhubOutput = execSync(
//   'npx sf config get target-dev-hub --json'
// ).toString();
// const devhub = JSON.parse(devhubOutput).result[0].value;
// if (devhub === null) {
//   devhubLogin();
// }

// // CHECK SECRETS
// ///////////////////////////////////////////////////////////////////////////
// const sfdxProjectJson = fs.readFileSync('sfdx-project.json', 'utf8');
// const unlockedPackages = JSON.parse(sfdxProjectJson).packageDirectories.flatMap(
//   (dir: any) => dir.dependencies || []
// );
// if (unlockedPackages.length > 0) {
//   const secretFile = '.ssdx/.packageKey';
//   if (!fs.existsSync(secretFile)) {
//     console.log(`\n${RED}Package Key is missing. ${NC}`);
//     const SECRET = readlineSync.question('What is the value? ');
//     fs.mkdirSync('.ssdx', { recursive: true });
//     fs.writeFileSync(secretFile, SECRET);
//     console.log('');
//   }
// }

// // SCRATCH ORG NAME AND DURATION
// ///////////////////////////////////////////////////////////////////////////
// let SCRATCH_ORG = '';
// let DURATION_DAYS = 5;

// // Parse command-line options
// const args = process.argv.slice(2);
// for (let i = 0; i < args.length; i += 2) {
//   const opt = args[i];
//   const value = args[i + 1];
//   switch (opt) {
//     case '-n':
//       SCRATCH_ORG = value;
//       break;
//     case '-d':
//       DURATION_DAYS = parseInt(value, 10);
//       if (DURATION_DAYS > 30) {
//         printHeader('Duration cannot be more than 30 days');
//         process.exit(1);
//       }
//       break;
//     case '-h':
//       console.log(
//         'Usage: createScratchOrg [-n scratch-org-name] [-d duration-in-days]. Default duration is 5 days'
//       );
//       process.exit(0);
//     default:
//       console.log(
//         `Invalid option ${opt}. Use -n for scratch org name and -d for duration`
//       );
//       process.exit(1);
//   }
// }

// if (SCRATCH_ORG === '') {
//   printHeader('Scratch Org Name');
//   console.log('');
//   SCRATCH_ORG = readlineSync.question('Scratch org name: ');
// }

// // DELETE OLD ORG
// ///////////////////////////////////////////////////////////////////////////
// const targetOrgOutput = execSync(
//   'npx sf config get target-org --json'
// ).toString();
// const oldScratchOrg = JSON.parse(targetOrgOutput).result[0].value;

// function deleteExistingOrg() {
//   printHeader(`Deleting Scratch Org named '${oldScratchOrg}'`);
//   const output = execSync(
//     `npx sf org delete scratch --no-prompt --target-org ${oldScratchOrg} 2>&1`
//   ).toString();
//   console.log(output);
//   console.log('✅ Done');
// }

// if (oldScratchOrg !== null) {
//   const orgListOutput = execSync('npx sf org list --json').toString();
//   const orgList = JSON.parse(orgListOutput);
//   const list = orgList.result.scratchOrgs.find(
//     (org: any) => org.alias === oldScratchOrg && org.status === 'Active'
//   );

//   if (list !== undefined) {
//     printHeader('Delete old Scratch Org');
//     console.log('');
//     const yn = readlineSync.keyInSelect(
//       ['Yes', 'No'],
//       `Do you want to delete the existing Scratch Org? (${oldScratchOrg})`
//     );
//     switch (yn) {
//       case 0:
//         deleteExistingOrg();
//         break;
//       case 1:
//         break;
//       default:
//         break;
//     }
//   }
// }

// // CREATE SCRATCH ORG
// ///////////////////////////////////////////////////////////////////////////
// function createScratchOrgFromSnapshot() {
//   const snapshot = JSON.parse(
//     fs.readFileSync('./config/project-scratch-def-snapshot.json', 'utf8')
//   ).snapshot;
//   printHeader(
//     `Creating Scratch Org named '${SCRATCH_ORG}' from snapshot '${snapshot}' with duration ${DURATION_DAYS} days`
//   );
//   execSync(
//     `npx sf org create scratch --definition-file=./config/project-scratch-def-snapshot.json --alias ${SCRATCH_ORG} --duration-days ${DURATION_DAYS} --set-default --wait 45 2>&1`
//   );
//   fs.writeFileSync(
//     'language.apex',
//     "List<User> user = [SELECT Id FROM User WHERE Name = 'User User' LIMIT 1]; user[0].LanguageLocaleKey = 'en_US'; update user;"
//   );
//   execSync('npx sf apex run --file language.apex 2>&1');
//   fs.unlinkSync('language.apex');
// }

// function createNormalScratchOrg() {
//   printHeader(
//     `Creating Scratch Org named '${SCRATCH_ORG}' with duration ${DURATION_DAYS} days`
//   );
//   execSync(
//     `npx sf org create scratch --definition-file=./config/project-scratch-def.json --alias ${SCRATCH_ORG} --duration-days ${DURATION_DAYS} --set-default --wait 20 2>&1`
//   );
// }

// if (fs.existsSync('./config/project-scratch-def-snapshot.json')) {
//   printHeader('Scratch Org Creation');
//   console.log('');
//   const yn = readlineSync.keyInSelect(
//     ['Yes', 'No'],
//     'Do you want to create a Scratch Org from a Snapshot?'
//   );
//   switch (yn) {
//     case 0:
//       createScratchOrgFromSnapshot();
//       break;
//     case 1:
//       createNormalScratchOrg();
//       break;
//     default:
//       break;
//   }
// } else {
//   createNormalScratchOrg();
// }

// // DURATION START
// ///////////////////////////////////////////////////////////////////////////
// const startTime = process.hrtime();

// // INSTALLING DEPENDENCIES
// ///////////////////////////////////////////////////////////////////////////
// if (unlockedPackages.length > 0) {
//   const secrets = unlockedPackages
//     .map(
//       (dependency: any) =>
//         `${dependency.package}:${fs.readFileSync('.ssdx/.packageKey', 'utf8')}`
//     )
//     .join(' ');
//   printHeader('Installing Unlocked Packages');
//   const devhubUsernameOutput = execSync(
//     'npx sf config get target-dev-hub --json'
//   ).toString();
//   const devhubUsername = JSON.parse(devhubUsernameOutput).result[0].value;
//   execSync(
//     `npx sfp dependency:install --installationkeys "${secrets}" --targetusername ${SCRATCH_ORG} --targetdevhubusername ${devhubUsername}`,
//     { stdio: 'inherit' }
//   );
// }

// // INSTALLING MANAGED PACKAGES
// ///////////////////////////////////////////////////////////////////////////
// const ssdxConfigJson = fs.readFileSync('config/ssdx-config.json', 'utf8');
// const managedPackages = JSON.parse(ssdxConfigJson).managed_packages || [];
// if (managedPackages.length > 0) {
//   printHeader('Installing Managed Packages');
//   for (const PACKAGE_ID of managedPackages) {
//     console.log(`  - Installing ${PACKAGE_ID}`);
//     execSync(
//       `npx sf package install --no-prompt --publish-wait 60 --wait 60 --target-org=${SCRATCH_ORG} --package=${PACKAGE_ID}`,
//       { stdio: 'inherit' }
//     );
//   }
//   console.log('✅ Done');
// }

// // PUSHING METADATA
// ///////////////////////////////////////////////////////////////////////////
// printHeader('Pushing Metadata');
// execSync(
//   `npx sf project:deploy:start --ignore-conflicts --concise --target-org ${SCRATCH_ORG}`,
//   { stdio: 'inherit' }
// );

// // OPENING ORG
// ///////////////////////////////////////////////////////////////////////////
// execSync(`npx sf org open --target-org=${SCRATCH_ORG} >/dev/null 2>&1`);

// // ASSIGNING PERMSETS
// ///////////////////////////////////////////////////////////////////////////
// const permsets = JSON.parse(ssdxConfigJson).permsets_to_assign || [];
// if (permsets.length > 0) {
//   printHeader('Sleeping for 30 seconds 😴');
//   sleep(30);

//   printHeader('Assigning Permission Set');
//   for (const PERMSET of permsets) {
//     console.log(`  - Assigning ${PERMSET}`);
//     execSync(
//       `npx sf force user permset assign --perm-set-name=${PERMSET} --target-org=${SCRATCH_ORG}`,
//       { stdio: 'inherit' }
//     );
//   }
// }

// // DURATION
// ///////////////////////////////////////////////////////////////////////////
// const endTime = process.hrtime(startTime);
// const duration = Math.round((endTime[0] * 1000 + endTime[1] / 1000000) / 1000);
// printHeader('🚀 Done');
// console.log(
//   `Org is ready! ${BLUE}(${Math.floor(duration / 60)} minutes and ${
//     duration % 60
//   } seconds elapsed)${NC}`
// );
