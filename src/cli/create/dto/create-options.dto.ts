import {
  ScratchOrgCreateOptions,
  ScratchOrgCreateResult,
} from '@salesforce/core';
//  TODO: convert to object with properties and methods, such as setAlias, chooseConfig, verifyPackageKey, findDevhub, setDevhub, setScratchOrgConfig
export default interface CreateOptions {
  durationDays: string;
  scratchOrgName: string;
  targetDevHub: string;
  packageKey: string;
  scratchOrgConfigPath: string;
  scratchOrgConfig: ScratchOrgCreateOptions;
  scratchOrgResult: ScratchOrgCreateResult;
}
