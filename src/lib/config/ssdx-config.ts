import { SlotOption } from 'cli/resource-assignment-manager/dto/resource-config.dto.js';
import { Resource, ResourceType, ssdxConfig } from 'dto/ssdx-config.dto.js';
import fs from 'fs';
import { logger } from 'lib/log.js';

export function fetchConfig(): SSDX {
  try {
    const config = JSON.parse(
      fs.readFileSync('ssdx-config.json', 'utf8')
    ) as ssdxConfig;
    return new SSDX(config);
  } catch (error) {
    throw new Error(
      'Failed to parse ssdx-config.json, make sure it is a valid JSON file with correct structure. See documentation.'
    );
  }
}

// export { Resource, ResourceType };

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
      ...(this.isPreDependencies ? this.config.pre_dependencies : []),
      ...(this.isPreDeploy ? this.config.pre_deploy : []),
      ...(this.isPostDeploy ? this.config.post_deploy : []),
      ...(this.isPostInstall ? this.config.post_install : []),
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
