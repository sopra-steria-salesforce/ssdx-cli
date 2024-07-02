interface SlotOptions {
  preDependencies: SlotOption;
  preDeploy: SlotOption;
  postDeploy: SlotOption;
}

export interface SlotOption {
  targetOrg?: string;
  preDependencies: boolean;
  preDeploy: boolean;
  postDeploy: boolean;
  postInstall: boolean;
  showOutput: boolean;
  ci: boolean;
}

export function getSlotOptions(targetOrg: string): SlotOptions {
  const init: SlotOption = {
    ...emptySlotOption,
    targetOrg: targetOrg,
  };
  const options = {
    preDependencies: { ...init, preDependencies: true },
    preDeploy: { ...init, preDeploy: true },
    postDeploy: { ...init, postDeploy: true },
  };
  return options;
}

export const emptySlotOption: SlotOption = {
  preDependencies: false,
  preDeploy: false,
  postDeploy: false,
  postInstall: false,
  showOutput: false,
  ci: false,
};
