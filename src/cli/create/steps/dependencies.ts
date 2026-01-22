import ora from 'ora';
import CreateOptions from '../create.dto.js';
import fs from 'fs';
import * as print from 'lib/print-helper.js';
import { run, OutputType } from 'lib/command-helper.js';
import { ProjectJson, PackagePackageDir, PackageDirDependency } from '@salesforce/schemas';

export async function installDependencies(): Promise<void> {
  const dependencies = new Dependencies();
  await dependencies.install();
}

class Dependencies {
  sfdxProject!: ProjectJson;
  options!: CreateOptions;

  constructor() {
    this.getSfdxProject();
  }

  private getSfdxProject() {
    const SFDX_PROJECT_PATH = './sfdx-project.json';
    const SFDX_PROJECT_DATA = fs.readFileSync(SFDX_PROJECT_PATH, 'utf8');
    this.sfdxProject = JSON.parse(SFDX_PROJECT_DATA);
  }

  public async install(): Promise<void> {
    if (!this.hasDependencies) return;

    print.subheader('Install Dependencies');

    if (CreateOptions.skipDependencies) {
      print.warning('Skipping dependency installation');
      return;
    }

    await run({
      cmd: 'npx sfp dependency:install',
      args: [
        '--installationkeys',
        this.packageKeys,
        '--targetusername',
        `"${CreateOptions.scratchOrgName}"`,
        '--targetdevhubusername',
        CreateOptions.targetDevHub,
      ],
      outputType: OutputType.OutputLive,
    });

    const spinner = ora('Installed Dependencies Successfully').start();
    spinner.succeed();
  }

  private get hasDependencies(): boolean {
    return this.getDependencies.length > 0;
  }

  private get getPackageDirectories(): PackagePackageDir[] {
    if (!this.sfdxProject.packageDirectories || this.sfdxProject.packageDirectories.length === 0) {
      return [];
    }

    const packageDirectories = this.sfdxProject.packageDirectories as PackagePackageDir[];
    return packageDirectories || [];
  }

  private get getDependencies(): PackageDirDependency[] {
    const packageDirectories = this.getPackageDirectories;
    if (packageDirectories.length === 0) {
      return [];
    }

    const dependencies = packageDirectories[0].dependencies as PackageDirDependency[];
    return dependencies || [];
  }

  private get packageKeys(): string {
    if (!this.hasDependencies) return '';

    const dependencies = [];
    for (const dependency of this.getDependencies) {
      if (dependency.versionNumber) {
        dependencies.push(`${dependency.package}:${CreateOptions.packageKey}`);
      }
    }

    return `"${dependencies.join(' ')}"`;
  }
}
