# SSDX CLI

SSDX CLI is a helper tool designed to streamline the process of working with Salesforce DX (SFDX). It provides commands to quickly create and manage scratch orgs, assign resources, and authenticate orgs, making it easier to develop and deploy Salesforce applications.

## Features

- `Scratch Org Management:` Quickly create and configure scratch orgs.
- `Resource Assignment:` Assign Apex, JavaScript, permission sets, licenses, and metadata to orgs.
- `Org Authentication:` Authenticate Salesforce orgs for development and deployment.

## Installation

To install SSDX CLI, ensure you have Node.js (>=20) and install [ssdx-cli from npm](https://www.npmjs.com/package/ssdx-cli):

```bash
npm install ssdx-cli --global
```

Or locally:

```bash
npm install ssdx-cli --save-dev
```

# Commands

## auth

Authenticate a Salesforce org:

```bash
ssdx auth --env-name production
```

**Options:**

- `-n, --env-name <string>:` The local name of the scratch org.

## create

Create and configure a new scratch org:

```bash
ssdx create -n my_feature
```

**Options:**

- `-n, --scratch-org-name <string>:` The alias to give the scratch org.
- `-d, --duration-days <number>:` The number of days to keep the scratch org (default: 5).
- `-c, --config-file <string>:` The scratch org config file (default: as defined in ssdx-config.json).
- `-v, --target-dev-hub <string>:` The alias or username of the dev hub org.
- `--skip-dependencies:` Skip dependency installation.
- `--skip-deployment:` Skip the deployment step.
- `--ci:` Disable fancy output for CI environments.
- `--disable-notifications:` Disable OS notifications (useful for CI environments)

## resource

Assign resources to a Salesforce org based on the configuration in ssdx-config.json.

```bash
ssdx resource [options]
```

**Options:**

- `-o, --target-org <string>:` The org to run the scripts on.
- `--pre-dependencies:` Run "pre_dependencies" resources.
- `--pre-deploy:` Run "pre_deploy" resources.
- `--post-deploy:` Run "post_deploy" resources.
- `--post-install:` Run "post_install" resources.
- `--show-output:` Show output of resource assignments.
- `-l, --test-level <string>:` Specify the test level for metadata operations (default: NoTestRun).
- `--ci:` Disable fancy output for CI environments.
- `--disable-notifications:` Disable OS notifications (useful for CI environments)

# Configuration

The CLI uses a configuration file named `ssdx-config.json` at root level, to define resource assignments and other settings.

```json
{
  // optional
  "default_config": "config/project-scratch-def.json",

  // runs before installing dependencies
  "pre_dependencies": [],

  // runs before metadata push
  "pre_deploy": [
    {
      "type": "permissionSetLicense",
      "value": "EmbeddedServiceMessagingUserPsl",
      "continue_on_error": true
    },
    {
      "type": "apex",
      "value": "bin/apex/enableChatUser.apex",
      "continue_on_error": true
    }
  ],

  // runs after metadata push
  "post_deploy": [
    {
      "type": "apex",
      "value": "bin/apex/addToGroup.apex",
      "continue_on_error": true
    },
    {
      "type": "js",
      "value": "bin/js/manipulateMetadataBeforeDeploy.js"
    },
    {
      "type": "metadata",
      "value": "unpackaged"
    },
    {
      "type": "permissionSetGroup",
      "value": "PermissionSetGroupDevName"
    },
    {
      "type": "permissionSet",
      "value": "PermissionSetDevName"
    },
    ,
    {
      // Automatically sets --targetusername when using SFDMU
      "type": "sf",
      "value": "sf sfdmu run --sourceusername csvfile --path ./sfdmu -w -n"
    }
  ],

  // runs after successfully installing a package to an environment (must be called specifically using the resource command)
  "post_install": [
    {
      "type": "js",
      "value": "bin/js/manipulateMetadataBeforeDeploy.js"
    },
    {
      "type": "metadata",
      "value": "unpackaged"
    }
  ]
}
```

# License

This project is licensed under the MIT License.
