export interface OrgList {
  status: number;
  result: Result;
  warnings: string[];
}

export interface Result {
  other: any[];
  sandboxes: Sandbox[];
  nonScratchOrgs: NonScratchOrg[];
  devHubs: DevHub[];
  scratchOrgs: ScratchOrg[];
}

export interface Sandbox {
  accessToken: string;
  instanceUrl: string;
  orgId: string;
  username: string;
  loginUrl: string;
  clientId: string;
  isDevHub: boolean;
  instanceApiVersion: string;
  instanceApiVersionLastRetrieved: string;
  name?: string;
  instanceName?: string;
  namespacePrefix: any;
  isSandbox: boolean;
  isScratch: boolean;
  trailExpirationDate: any;
  tracksSource?: boolean;
  alias: string;
  isDefaultDevHubUsername: boolean;
  isDefaultUsername: boolean;
  lastUsed: string;
  connectedStatus: string;
  privateKey?: string;
}

export interface NonScratchOrg {
  accessToken: string;
  instanceUrl: string;
  orgId: string;
  username: string;
  loginUrl: string;
  clientId: string;
  isDevHub: boolean;
  instanceApiVersion: string;
  instanceApiVersionLastRetrieved: string;
  name?: string;
  instanceName?: string;
  namespacePrefix: any;
  isSandbox?: boolean;
  isScratch?: boolean;
  trailExpirationDate: any;
  tracksSource?: boolean;
  alias: string;
  isDefaultDevHubUsername: boolean;
  isDefaultUsername: boolean;
  lastUsed: string;
  connectedStatus: string;
  privateKey?: string;
}

export interface DevHub {
  accessToken: string;
  instanceUrl: string;
  orgId: string;
  username: string;
  loginUrl: string;
  clientId: string;
  isDevHub: boolean;
  instanceApiVersion: string;
  instanceApiVersionLastRetrieved: string;
  alias: string;
  isDefaultDevHubUsername: boolean;
  isDefaultUsername: boolean;
  lastUsed: string;
  connectedStatus: string;
  privateKey?: string;
}

export interface ScratchOrg {
  accessToken: string;
  instanceUrl: string;
  orgId: string;
  username: string;
  loginUrl: string;
  clientId: string;
  isDevHub: boolean;
  devHubUsername: string;
  created: string;
  expirationDate: string;
  createdOrgInstance: string;
  isScratch: boolean;
  isSandbox: boolean;
  snapshot: string;
  instanceApiVersion: string;
  instanceApiVersionLastRetrieved: string;
  tracksSource: boolean;
  alias: string;
  isDefaultDevHubUsername: boolean;
  isDefaultUsername: boolean;
  lastUsed: string;
  signupUsername: string;
  createdBy: string;
  createdDate: string;
  devHubOrgId: string;
  devHubId: string;
  attributes: Attributes;
  orgName: string;
  edition: any;
  status: string;
  isExpired: boolean;
  namespace: any;
  defaultMarker?: string;
}

export interface Attributes {
  type: string;
  url: string;
}
