import type {RoleDeclaration} from ".";

export const harvester: RoleDeclaration = {
    targetPopulation: 6,
    bodies: [
        [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        [WORK, CARRY, MOVE],
    ],
};
