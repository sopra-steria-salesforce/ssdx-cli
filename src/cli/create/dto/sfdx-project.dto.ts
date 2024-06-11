export default interface SfdxProject {
  packageDirectories: PackageDirectory[];
  namespace: string;
  sfdcLoginUrl: string;
  sourceApiVersion: string;
}

export interface PackageDirectory {
  path: string;
  default: boolean;
  package: string;
  versionNumber: string;
  dependencies: Dependency[];
}

export interface Dependency {
  package: string;
  versionNumber: string;
}
