import { getCurrentScratchOrgAlias } from 'lib/config/sf-config.js';
import { Command } from 'commander';
import { Notification } from 'lib/notification.js';

export function addBaseOptions(command: Command): void {
  command
    .optionsGroup('Global Parameters')
    .option('--disable-notifications', 'Disabled OS notifications for steps', false)
    .option('--ci', 'Disables interactivity for more granular output', false)
    .option('--debug', 'Output debug information to console', false);
}

//  TODO: convert to object with properties and methods, such as setAlias, chooseConfig, findDevhub, setDevhub
export default class BaseOptions {
  public static targetOrg: string;
  // public static targetUsername: string;
  public static targetDevHub: string;

  public static disableNotifications: string;
  public static ci: boolean = false;
  public static debug: boolean = false;

  public static setFields(options: typeof BaseOptions): void {
    BaseOptions.targetOrg = options.targetOrg; // TODO: give error if using spaces
    BaseOptions.targetDevHub = options.targetDevHub;

    BaseOptions.disableNotifications = options.disableNotifications;
    Notification.disableNotifications = !!options.disableNotifications;
    BaseOptions.ci = options.ci;
    BaseOptions.debug = options.debug;
    process.env.DEBUG = options.debug ? 'true' : 'false';
  }

  public static async getTargetOrg(): Promise<string> {
    return BaseOptions.targetOrg ?? (await getCurrentScratchOrgAlias());
  }
}
