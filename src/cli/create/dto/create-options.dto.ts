import {
  ScratchOrgCreateOptions,
  ScratchOrgCreateResult,
} from '@salesforce/core';

export default interface CreateOptions {
  durationDays: string;
  scratchOrgName: string;
  targetDevHub: string;
  packageKey: string;
  scratchOrgConfig: ScratchOrgCreateOptions;
  scratchOrgResult: ScratchOrgCreateResult;
}
