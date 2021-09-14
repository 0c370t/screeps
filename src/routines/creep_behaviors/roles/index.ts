import {builder} from "./builder";
import {harvester} from "./harvester";

export interface RoleDeclaration {
    targetPopulation: number;
    bodies: BodyPartConstant[][];
}

export const roles = {
    harvester,
    builder,
};

export type Role = keyof typeof roles;
