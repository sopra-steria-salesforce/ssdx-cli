export default interface SlotOption {
  targetOrg?: string;
  init: boolean;
  preDeploy: boolean;
  normal: boolean;
  postDeploy: boolean;
}

interface SlotOptions {
  init: SlotOption;
  preDeploy: SlotOption;
  normal: SlotOption;
  postDeploy: SlotOption;
}

export function getSlotOptions(targetOrg?: string): SlotOptions {
  const options = {
    init: init,
    preDeploy: preDeploy,
    normal: normal,
    postDeploy: postDeploy,
  };
  options.init.targetOrg = targetOrg;
  options.preDeploy.targetOrg = targetOrg;
  options.normal.targetOrg = targetOrg;
  options.postDeploy.targetOrg = targetOrg;
  return options;
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
