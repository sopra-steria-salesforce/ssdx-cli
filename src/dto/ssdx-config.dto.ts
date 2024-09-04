export interface ssdxConfig {
  default_config: string;
  pre_dependencies: PreDependency[];
  pre_deploy: PreDeploy[];
  post_deploy: PoststDeploy[];
  post_install: PostInstall[];
}

export type PreDependency = Resource;
export type PreDeploy = Resource;
export type PoststDeploy = Resource;
export type PostInstall = Resource;

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
  CMD = 'cmd',
  PERMISSION_SET = 'permissionSet',
  LICENSE = 'permissionSetLicense',
  METADATA = 'metadata',
}
