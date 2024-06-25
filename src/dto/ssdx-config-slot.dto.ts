export default interface SlotOption {
  init: boolean;
  preDeploy: boolean;
  normal: boolean;
  postDeploy: boolean;
}

export const init: SlotOption = {
  init: true,
  preDeploy: false,
  normal: false,
  postDeploy: false,
};

export const preDeploy: SlotOption = {
  init: false,
  preDeploy: true,
  normal: false,
  postDeploy: false,
};

export const normal: SlotOption = {
  init: false,
  preDeploy: true,
  normal: false,
  postDeploy: false,
};

export const postDeploy: SlotOption = {
  init: false,
  preDeploy: false,
  normal: false,
  postDeploy: true,
};
