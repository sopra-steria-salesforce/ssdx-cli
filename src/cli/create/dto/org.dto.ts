export interface Org {
  status: number;
  result: Result;
  warnings: string[];
}

export interface Result {
  id: string;
  devHubId: string;
  apiVersion: string;
  accessToken: string;
  instanceUrl: string;
  username: string;
  clientId: string;
  status: string;
  expirationDate: string;
  createdBy: string;
  edition: string;
  orgName: string;
  createdDate: string;
  signupUsername: string;
  alias: string;
}
