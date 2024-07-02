import { OutputType, run } from 'lib/command-helper.js';
import ora from 'ora';
import * as print from 'lib/print-helper.js';
import { SlotOption } from './dto/resource-config.dto.js';
import { SSDX, fetchConfig } from 'lib/config/ssdx-config.js';
// import {
//   SSDX,
//   fetchConfig,
//   Resource,
//   ResourceType,
// } from 'lib/config/ssdx-config.js';
import { Color, setColor } from 'lib/print-helper/print-helper-formatter.js';
import pad from 'pad';
import { Resource, ResourceType } from 'dto/ssdx-config.dto.js';
// import { logger } from 'lib/log.js';

export class ResourceAssignmentManager {
  options: SlotOption;
  targetOrg: string;
  ssdxConfig: SSDX = fetchConfig();

  constructor(options: SlotOption, targetOrg: string) {
    this.options = options;
    this.targetOrg = targetOrg;
  }

  public async run(): Promise<void> {
    if (!this.ssdxConfig.hasResources()) return;

    print.subheader(
      this.ssdxConfig.resourceTypes.join(', ') + ' Steps',
      undefined,
      Color.bgCyan
    );

    for (const resource of this.ssdxConfig.resources) {
      await this.runResource(resource);
    }
  }

  private async runResource(resource: Resource): Promise<void> {
    if (resource.skip) return this.skipResource(resource);

    await run({
      cmd: resource.cmd,
      args: resource.args,
      outputType: OutputType.Spinner,
      spinnerText: this.getSpinnerText(resource),
      exitOnError: !resource.continue_on_error,
    });
  }

  private skipResource(resource: Resource) {
    const spinnerText =
      this.getSpinnerText(resource) +
      '...  SKIPPING due to invalid configuration type';
    ora(spinnerText).warn();
    return;
  }

  private getSpinnerText(resource: Resource): string | undefined {
    const type = this.getType(resource);
    const file = this.getFileName(resource);
    const path = this.getPath(resource);
    return type + file + path;
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
    return setColor(type, Color.bold);
  }
  private getFileName(resource: Resource) {
    const file = resource.value.split('/').pop() ?? '';
    return setColor(file, Color.green);
  }
  private getPath(resource: Resource): string {
    let path = resource.value.split('/').slice(0, -1).join('/');
    path = setColor(path, Color.blue);
    return path ? ` (from ${path})` : '';
  }
}
