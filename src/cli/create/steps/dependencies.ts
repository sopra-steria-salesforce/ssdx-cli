import CreateOptions from '../dto/create-options.dto.js';

export async function installDependencies(
  options: CreateOptions
): Promise<void> {
  const org = new Dependencies(options);
  await org.install();
}

class Dependencies {
  options!: CreateOptions;

  constructor(options: CreateOptions) {
    this.options = options;
  }

  public async install(): Promise<void> {
    console.log('');

    await this.setAlias();
  }

  private async setAlias(): Promise<void> {
    console.log(this.options.packageKey);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(this.options.scratchOrgUsername);
  }
}
