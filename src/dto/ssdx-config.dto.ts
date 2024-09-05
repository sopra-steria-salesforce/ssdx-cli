export interface ssdxConfig {
  default_config: string;
  pre_dependencies: PreDependency[];
  pre_deploy: PreDeploy[];
  post_deploy: PostDeploy[];
  post_install: PostInstall[];
}

export type PreDependency = Resource;
export type PreDeploy = Resource;
export type PostDeploy = Resource;
export type PostInstall = Resource;

export interface Resource {
  type: ResourceType;
  cmd: string;
  args: string[];
  value: string;
  skip_target_org: boolean;
  continue_on_error: boolean;
  print_output: boolean;
  skip: boolean;
}

export enum ResourceType {
  APEX = 'apex',
  JS = 'js',
  SF = 'sf',
  PERMISSION_SET = 'permissionSet',
  PERMISSION_SET_GROUP = 'permissionSetGroup',
  LICENSE = 'permissionSetLicense',
  METADATA = 'metadata',
}
