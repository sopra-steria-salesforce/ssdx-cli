export default interface ssdxConfig {
  init: Init;
  pre_deploy: PreDeploy;
  post_deploy: PostDeploy;
}

interface Init {
  permissions: Permissions;
  scripts: Scripts;
}

interface PreDeploy {
  permissions: Permissions;
  scripts: Scripts;
}

interface PostDeploy {
  permissions: Permissions;
  scripts: Scripts;
}

interface Permissions {
  permsets: string[];
  licenses: string[];
}

interface Scripts {
  apex: string[];
  js: string[];
}
