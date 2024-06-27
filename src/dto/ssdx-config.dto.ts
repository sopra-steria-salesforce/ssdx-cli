export default interface ssdxConfig {
  default_config: string;
  pre_dependencies: Resource[];
  pre_deploy: Resource[];
  post_deploy: Resource[];
}

export interface Resource {
  type: ResourceType;
  value: string;
}

export enum ResourceType {
  APEX = 'apex',
  JS = 'js',
  PERMISSION_SET = 'permissionSet',
  LICENSE = 'permissionSetLicense',
  METADATA = 'metadata',
}
