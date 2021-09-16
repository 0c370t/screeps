import {laborer} from "./laborer";

export const roles = {
    laborer,
};

export type RoleType = keyof typeof roles;
export {RoleHelper} from "./RoleHelper";
