export default interface AssignOptions {
  init: boolean;
  preDeploy: boolean;
  postDeploy: boolean;
}

export const init: AssignOptions = {
  init: true,
  preDeploy: false,
  postDeploy: false,
};

export const preDeploy: AssignOptions = {
  init: false,
  preDeploy: true,
  postDeploy: false,
};

export const postDeploy: AssignOptions = {
  init: false,
  preDeploy: false,
  postDeploy: true,
};
