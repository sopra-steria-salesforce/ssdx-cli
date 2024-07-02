export interface ssdxConfig {
  default_config: string;
  pre_dependencies: Resource[];
  pre_deploy: Resource[];
  post_deploy: Resource[];
  post_install: Resource[];
}

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
