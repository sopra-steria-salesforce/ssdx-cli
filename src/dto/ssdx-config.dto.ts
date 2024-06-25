export default interface ssdxConfig {
  default_config: string;
  init: Types;
  pre_deploy: Types;
  post_deploy: Types;
}

interface Types {
  permissions: Permissions;
  scripts: Scripts;
  metadata: string[];
}

interface Permissions {
  permsets: string[];
  licenses: string[];
}

interface Scripts {
  apex: string[];
  js: string[];
}
