export interface ssdxConfig {
  default_config: string;
  pre_dependencies: PreDependency[];
  pre_deploy: PreDeploy[];
  post_deploy: PoststDeploy[];
  post_install: PostInstall[];
}

export interface PreDependency extends Resource {}
export interface PreDeploy extends Resource {}
export interface PoststDeploy extends Resource {}
export interface PostInstall extends Resource {}

export interface Resource {
  type: ResourceType;
  cmd: string;
  args: string[];
  value: string;
  continue_on_error: boolean;
  skip: boolean;
}

export enum ResourceType {
  APEX = 'apex',
  JS = 'js',
  PERMISSION_SET = 'permissionSet',
  LICENSE = 'permissionSetLicense',
  METADATA = 'metadata',
}
