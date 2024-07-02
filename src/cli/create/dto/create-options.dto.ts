import {
  ScratchOrgCreateOptions,
  ScratchOrgCreateResult,
} from '@salesforce/core';
import { SSDX } from 'lib/config/ssdx-config.js';

//  TODO: convert to object with properties and methods, such as setAlias, chooseConfig, verifyPackageKey, findDevhub, setDevhub, setScratchOrgConfig
export default interface CreateOptions {
  configFile: string;
  durationDays: string;
  scratchOrgName: string;
  targetDevHub: string;
  packageKey: string;
  scratchOrgConfig: ScratchOrgCreateOptions;
  scratchOrgResult: ScratchOrgCreateResult;
  skipDependencies: string;
  skipDeployment: string;
  skipPermsetAssignment: string;
  ssdxConfig: SSDX;
}
