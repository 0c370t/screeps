import type {RoleDeclaration} from ".";

export const builder: RoleDeclaration = {
    targetPopulation: 4,
    bodies: [
        [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        [WORK, CARRY, MOVE],
    ],
};
