import * as print from 'lib/print-helper.js';
import { ScratchOrgCreateOptions, ScratchOrgCreateResult } from '@salesforce/core';
import BaseOptions from 'dto/base.dto.js';

//  TODO: convert to object with properties and methods, such as setAlias, chooseConfig, verifyPackageKey, findDevhub, setDevhub, setScratchOrgConfig
export default class CreateOptions extends BaseOptions {
  public static scratchOrgConfig: ScratchOrgCreateOptions;
  public static scratchOrgResult: ScratchOrgCreateResult;

  // parameters
  public static configFile: string;
  public static durationDays: string;
  public static scratchOrgName: string; // TODO: remove and use targetOrg
  public static packageKey: string;

  // flags
  public static deleteCurrentOrg: string;
  public static skipDependencies: string;
  public static skipDeployment: string;
  public static skipPermsetAssignment: string;
  public static enablePools: string;

  // debug
  public static keepExistingOrg: string;

  public static setFields(options: typeof CreateOptions): void {
    super.setFields(options);
    CreateOptions.scratchOrgConfig = options.scratchOrgConfig;
    CreateOptions.scratchOrgResult = options.scratchOrgResult;

    CreateOptions.configFile = options.configFile;
    CreateOptions.durationDays = options.durationDays;
    CreateOptions.scratchOrgName = options.scratchOrgName; // TODO: give error if adding spaces or invalid signs
    CreateOptions.packageKey = options.packageKey;

    CreateOptions.deleteCurrentOrg = options.deleteCurrentOrg;
    CreateOptions.skipDependencies = options.skipDependencies;
    CreateOptions.skipDeployment = options.skipDeployment;
    CreateOptions.skipPermsetAssignment = options.skipPermsetAssignment;
    CreateOptions.enablePools = options.enablePools;

    CreateOptions.keepExistingOrg = options.keepExistingOrg;
    print.debug('Parsing create command parameters', options);
  }
}
