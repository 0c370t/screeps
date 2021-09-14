import {harvester} from "./harvester";

export interface RoleDeclaration {
    targetPopulation: number;
    bodies: BodyPartConstant[][];
}

export const roles = {
    harvester,
};

export type Role = keyof typeof roles;
