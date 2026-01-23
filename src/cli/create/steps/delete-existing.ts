import colors from 'colors/safe.js';
import ora, { Ora } from 'ora';
import CreateOptions from '../create.dto.js';
import { Org } from '@salesforce/core';
import { confirm } from '@inquirer/prompts';
import { getCurrentScratchOrg, getCurrentScratchOrgAlias } from 'lib/config/sf-config.js';
import { logger } from 'lib/log.js';
import * as print from 'lib/print-helper.js';

export async function delete_question(): Promise<void> {
  const org = new OrgManager();

  if (await org.checkIfActiveScratchOrg()) {
    await org.askToDeleteOrg();
  }
}

class OrgManager {
  spinner!: Ora;
  currentScratchOrg?: Org;

  constructor() {}

  public async checkIfActiveScratchOrg(): Promise<boolean> {
    this.currentScratchOrg = await getCurrentScratchOrg();

    if (!this.currentScratchOrg || CreateOptions.keepExistingOrg || (await this.notScratchOrg())) {
      return false;
    }

    return await this.isActive();
  }

  private async notScratchOrg(): Promise<boolean> {
    return (await this.currentScratchOrg?.determineIfScratch()) !== true;
  }

  private async isActive(): Promise<boolean> {
    try {
      await this.currentScratchOrg?.refreshAuth();
      return true;
    } catch (error) {
      logger.error(`Error checking scratch org status, likely expired: ${String(error)}`);
      return false;
    }
  }

  public async askToDeleteOrg(): Promise<void> {
    const orgUsername = this.currentScratchOrg?.getUsername() || '';
    const alias = (await getCurrentScratchOrgAlias()) || '';

    const toDelete = await confirm({
      message: `You have an existing scratch org.
  Alias: ${colors.yellow(alias)}
  Username: ${colors.yellow(orgUsername)}

  Do you want to delete it?`,
    });

    if (toDelete) {
      await this.deleteOrg();
    }
  }

  public async deleteOrg(): Promise<void> {
    this.spinner = ora('Deleting existing Scratch Org ...').start();

    try {
      await this.currentScratchOrg?.delete();
      this.spinner.suffixText = 'done';
      this.spinner.succeed();
    } catch (error) {
      this.spinner.suffixText = 'failed! Error:';
      this.spinner.fail();
      print.error(String(error));
    }
  }
}
