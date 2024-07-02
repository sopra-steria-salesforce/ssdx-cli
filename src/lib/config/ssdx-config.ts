import { SlotOption } from 'cli/resource-assignment-manager/dto/resource-config.dto.js';
import { Resource, ResourceType, ssdxConfig } from 'dto/ssdx-config.dto.js';
import fs from 'fs';
import { logger } from 'lib/log.js';
import * as print from 'lib/print-helper.js';
import { exit } from 'process';

export function fetchConfig(): SSDX {
  let config;
  try {
    config = JSON.parse(
      fs.readFileSync('ssdx-config.json', 'utf8')
    ) as ssdxConfig;
  } catch (error) {
    print.error(
      'Failed to parse ssdx-config.json. Make sure it is a valid JSON file with correct structure (see documentation). View logs for details (./.ssdx/logs/)'
    );
    logger.error(error);
    exit(1);
  }
  try {
    return new SSDX(config);
  } catch (error) {
    print.error(
      'Failed to process ssdx-config.json. See documentation on correct usage. View logs for details (./.ssdx/logs/)'
    );
    logger.error(error);
    exit(1);
  }
}

export class SSDX {
  config: ssdxConfig;
  slotOption?: SlotOption;

  constructor(config: ssdxConfig) {
    this.config = config;
    this.setParameters();
  }

  // gets all resouces if no slot is added, or one (or more) if slots are added
  public get resources(): Resource[] {
    return [
      ...(this.isPreDependencies ? this.config.pre_dependencies ?? [] : []),
      ...(this.isPreDeploy ? this.config.pre_deploy ?? [] : []),
      ...(this.isPostDeploy ? this.config.post_deploy ?? [] : []),
      ...(this.isPostInstall ? this.config.post_install ?? [] : []),
    ];
  }

  // gets all resouce types if no slot is added, or one (or more) if slots are added
  public get resourceTypes(): string[] {
    return [
      ...(this.isPreDependencies ? ['Pre-dependencies'] : []),
      ...(this.isPreDeploy ? ['Pre-deploy'] : []),
      ...(this.isPostDeploy ? ['Post-deploy'] : []),
      ...(this.isPostInstall ? ['Post-package install'] : []),
    ];
  }

  public get isPreDependencies(): boolean {
    return !this.slotOption || this.slotOption.preDependencies;
  }
  public get isPreDeploy(): boolean {
    return !this.slotOption || this.slotOption.preDeploy;
  }
  public get isPostDeploy(): boolean {
    return !this.slotOption || this.slotOption.postDeploy;
  }
  public get isPostInstall(): boolean {
    return !this.slotOption || this.slotOption.postInstall;
  }

  public hasResources(): boolean {
    return this.resources.length > 0;
  }

  private setParameters() {
    for (const resource of this.resources) {
      resource.skip = false;
      switch (resource.type) {
        case ResourceType.APEX:
          resource.cmd = 'npx sf apex:run';
          resource.args = ['--file', resource.value, '--target-org'];
          break;
        case ResourceType.JS:
          resource.cmd = 'node';
          resource.args = [resource.value];
          break;
        case ResourceType.PERMISSION_SET:
          resource.cmd = 'npx sf org:assign:permset';
          resource.args = ['--name', resource.value, '--target-org'];
          break;
        case ResourceType.LICENSE:
          resource.cmd = 'npx sf org:assign:permsetlicense';
          resource.args = ['--name', resource.value, '--target-org'];
          break;
        case ResourceType.METADATA:
          resource.cmd = 'npx sf project:deploy:start';
          resource.args = [
            '--source-dir',
            resource.value,
            '--ignore-conflicts',
            '--concise',
            '--target-org',
          ];
          break;
        default:
          logger.error(
            `ERROR: Unsupported resource type: ${resource.type as string}`
          );
          resource.skip = true;
          break;
      }
    }
  }
}
