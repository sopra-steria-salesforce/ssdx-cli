export default interface SlotOption {
  init: boolean;
  preDeploy: boolean;
  postDeploy: boolean;
}

export const init: SlotOption = {
  init: true,
  preDeploy: false,
  postDeploy: false,
};

export const preDeploy: SlotOption = {
  init: false,
  preDeploy: true,
  postDeploy: false,
};

export const postDeploy: SlotOption = {
  init: false,
  preDeploy: false,
  postDeploy: true,
};
