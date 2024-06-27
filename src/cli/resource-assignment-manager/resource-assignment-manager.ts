import { Output, run } from '../../lib/command-helper.js';
import ora, { Ora } from 'ora';
import * as print from '../../lib/print-helper.js';
import ssdxConfig, {
  Resource,
  ResourceType,
} from '../../dto/ssdx-config.dto.js';
import { SlotOption } from './dto/resource-config.dto.js';
import { fetchConfig } from '../../lib/config/ssdx-config.js';
import { setColor } from '../../lib/print-helper/print-helper-formatter.js';
import pad from 'pad';
import { exit } from 'process';

export class ResourceAssignmentManager {
  options: SlotOption;
  targetOrg: string;
  ssdxConfig: ssdxConfig = fetchConfig();
  resources: Resource[] = [];
  resourceTypes: string[] = [];
  spinner: Ora = ora();

  constructor(options: SlotOption, targetOrg: string) {
    this.options = options;
    this.targetOrg = targetOrg;
    this.setResources();
  }

  private setResources(): void {
    if (this.options.preDependencies) {
      this.resources = [...this.resources, ...this.ssdxConfig.pre_dependencies];
      this.resourceTypes.push('Pre-dependencies');
    }
    if (this.options.preDeploy) {
      this.resources = [...this.resources, ...this.ssdxConfig.pre_deploy];
      this.resourceTypes.push('Pre-deploy');
    }
    if (this.options.postDeploy) {
      this.resources = [...this.resources, ...this.ssdxConfig.post_deploy];
      this.resourceTypes.push('Post-deploy');
    }
  }

  private hasResources(): boolean {
    return this.resources.length > 0;
  }

  public async run(): Promise<void> {
    if (!this.hasResources()) return;

    print.subheader(
      this.resourceTypes.join(', ') + ' Steps',
      undefined,
      print.Color.bgCyan
    );

    for (const resource of this.resources) {
      this.startSpinner(resource);
      try {
        await this.runResource(resource);
        this.stopSpinner();
      } catch (error: unknown) {
        this.errorSpinner(error as string);
      }
    }
  }

  private startSpinner(resource: Resource): void {
    const type = this.getType(resource);
    const file = this.getFileName(resource);
    const path = this.getPath(resource);
    this.spinner = ora(`${type}${file}${path}`).start();
  }
  private getType(resource: Resource) {
    let type = resource.type as string;
    if (resource.type === ResourceType.PERMISSION_SET) {
      type = 'PERMISSION SET';
    } else if (resource.type === ResourceType.LICENSE) {
      type = 'LICENSE';
    }
    type = pad(type + ':', 16, ' ');
    type = type.toUpperCase();
    return setColor(type, print.Color.bold);
  }
  private getFileName(resource: Resource) {
    const file = resource.value.split('/').pop() ?? '';
    return setColor(file, print.Color.green);
  }
  private getPath(resource: Resource): string {
    let path = resource.value.split('/').slice(0, -1).join('/');
    path = setColor(path, print.Color.blue);
    return path ? ` (from ${path})` : '';
  }
  private stopSpinner(): void {
    if (!this.spinner.isSpinning) return;
    this.spinner.succeed();
  }
  private errorSpinner(errorMsg: string): void {
    if (!this.spinner.isSpinning) return;
    this.spinner.suffixText = setColor(errorMsg, print.Color.red);
    this.spinner.fail();
    exit(1);
  }

  private async runResource(resource: Resource): Promise<void> {
    switch (resource.type) {
      case ResourceType.APEX:
        return await this.runApex(resource);
      case ResourceType.JS:
        return await this.runJs(resource);
      case ResourceType.PERMISSION_SET:
        return await this.assignPermissionSets(resource);
      case ResourceType.LICENSE:
        return await this.assignPermissionSetLicenses(resource);
      case ResourceType.METADATA:
        return await this.deployMetadata(resource);
      default:
        return this.errorSpinner(
          `ERROR: Unsupported resource type: ${resource.type as string}`
        );
    }
  }

  public async runApex(resource: Resource): Promise<void> {
    await run(
      'npx sf apex:run',
      ['--file', resource.value, '--target-org', this.targetOrg],
      Output.Supressed
    );
  }

  public async runJs(resource: Resource): Promise<void> {
    await run('node', [resource.value, this.targetOrg], Output.Supressed);
  }

  public async assignPermissionSets(resource: Resource): Promise<void> {
    await run(
      'npx sf org:assign:permset',
      ['--name', resource.value, '--target-org', this.targetOrg],
      Output.Supressed
    );
  }

  public async assignPermissionSetLicenses(resource: Resource): Promise<void> {
    await run(
      'npx sf org:assign:permsetlicense',
      ['--name', resource.value, '--target-org', this.targetOrg],
      Output.Supressed
    );
  }

  public async deployMetadata(resource: Resource): Promise<void> {
    await run(
      'npx sf project:deploy:start',
      [
        '--source-dir',
        resource.value,
        '--ignore-conflicts',
        '--concise',
        '--target-org',
        this.targetOrg,
      ],
      Output.Supressed
    );
  }
}
