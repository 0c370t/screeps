/**
 * @returns True if creep performed work, False if creep did not perform work
 */
export type RoleBehavior = (c: Creep) => unknown;

export interface Role {
    name: string;
    targetPopulation: number;
    behavior: RoleBehavior;
    bodies: BodyPartConstant[][];
}
