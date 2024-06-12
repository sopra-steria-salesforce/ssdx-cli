import CreateOptions from '../dto/create-options.dto.js';
import fs from 'fs';
import * as print from '../../../lib/print-helper.js';
import schema from '../dto/sfdx-project.dto.js';
import { run } from '../../../lib/command-helper.js';

export async function installDependencies(
  options: CreateOptions
): Promise<void> {
  const org = new Dependencies(options);
  await org.install();
}

class Dependencies {
  sfdxProject!: schema;
  options!: CreateOptions;

  constructor(options: CreateOptions) {
    this.options = options;
    this.getSfdxProject();
  }

  private getSfdxProject() {
    const SFDX_PROJECT_PATH = './sfdx-project.json';
    const SFDX_PROJECT_DATA = fs.readFileSync(SFDX_PROJECT_PATH, 'utf8');
    this.sfdxProject = JSON.parse(SFDX_PROJECT_DATA);
  }

  private get hasDependencies(): boolean {
    return (
      this.sfdxProject.packageDirectories &&
      this.sfdxProject.packageDirectories.length > 0 &&
      this.sfdxProject.packageDirectories[0].dependencies &&
      this.sfdxProject.packageDirectories[0].dependencies.length > 0
    );
  }

  public async install(): Promise<void> {
    if (!this.hasDependencies) return;

    await new Promise(resolve => setTimeout(resolve, 1000));
    print.header('Install Dependencies');

    run(
      `sfp dependency:install --installationkeys "${this.packageKeys}" --targetusername ${this.alias} --targetdevhubusername ${this.devhub}`
    );
  }

  private get alias(): string {
    return this.options.scratchOrgUsername;
  }

  private get devhub(): string {
    return this.options.targetDevHub;
  }

  private get packageKey(): string {
    return this.options.packageKey;
  }

  private get packageKeys(): string {
    const dependencies = [];
    if (
      this.sfdxProject.packageDirectories &&
      this.sfdxProject.packageDirectories.length > 0 &&
      this.sfdxProject.packageDirectories[0].dependencies &&
      this.sfdxProject.packageDirectories[0].dependencies.length > 0
    ) {
      for (const dependency of this.sfdxProject.packageDirectories[0]
        .dependencies) {
        dependencies.push(`${dependency.package}:${this.packageKey}`);
      }
    }
    return dependencies.join(',');
  }
}
