/*
	This scripts is an example of how to update a permission set with new values from an env, before deploying to productoion.
  Inside sfdx-config.json, this script is run from both "post_deploy" and "post_install", meaning it supposed to run after a scratch org deploy and a package install (sandbox or prod).
  This does NOT happen automatically, is entirely up to the developer on how CI/CD scripts are made. The developer needs to to add `ssdx resource --post-deploy` (or --post-install) somewhere in CI scripts.

  TARGET_ORG below will always be an org username or alias. If you run:
    - `ssdx resource --post-install`, it will be the default username set (sf config:get target-org)
    - `ssdx resource --post-install --target-org YOUR_ORG`, YOUR_ORG will be the TARGET_ORG
  This username can be used to query information, given that it is authenticated locally before running script (consider https://github.com/sopra-steria-salesforce/sf-cli-setup)
	This is practical when needing to make changes to metadata, before deploying to a scratch org, sandbox or even prod.
*/

/* -------------------------------------------------------------------------- */
/*                               Default Methods                              */
/*             Default methods to query data from the org created             */
/* -------------------------------------------------------------------------- */

const TARGET_ORG = process.argv[2];
const core = require('@salesforce/core'); // need to install `npm install --save-dev @salesforce/core` to use this

async function getConnection() {
  try {
    return (
      await core.Org.create({
        aliasOrUsername: TARGET_ORG,
      })
    ).getConnection();
  } catch (error) {
    throw new Error('\nFAILED TO CONNECT TO ORG:\n\n' + error);
  }
}

async function queryRecord(query) {
  const conn = await getConnection();
  const records = (await conn.query(query)).records;
  if (records.length === 0) throw new Error('No records found.');
  return records[0];
}

/* -------------------------------------------------------------------------- */
/*                               Custom Methods                               */
/*               Custom methods to perform the operation needed               */
/* -------------------------------------------------------------------------- */

const fs = require('fs');
const { parseString, Builder } = require('xml2js'); // need to install `npm install --save-dev xml2js` to use this
const FILE = 'bin/metadata/permissionsets/post_deploy.permissionset-meta.xml';
const CLASS_NAME = 'MyClass';

async function run() {
  const classRecord = await queryRecord(
    `SELECT Name FROM ApexClass WHERE Name = '${CLASS_NAME}' LIMIT 1`
  ); // bad example, because you already have the class name, but you can query any other information you need and use however you want

  // Read the permset
  let permset = fs.readFileSync(FILE, 'utf-8');

  // Parse the permset as XML
  parseString(permset, (err, result) => {
    permset = result;
  });

  // classAccess object
  let classAccess = {
    apexClass: classRecord.Name,
    enabled: true,
  };

  // Add classAccess
  if (!permset.PermissionSet.classAccesses) {
    permset.PermissionSet.classAccesses = [];
  }
  permset.PermissionSet.classAccesses.push(classAccess);

  // Convert the modified XML back to string
  const builder = new Builder();
  const modifiedPermset = builder.buildObject(permset);

  // Write the modified permset back to the file
  fs.writeFileSync(FILE, modifiedPermset);
}

// Run the script and make changes to the file
run();

// You can now deploy the file, using a new step inside ssdx-config.json (see file for this exact example)
