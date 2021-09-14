import {builder} from "./builder";
import {harvester} from "./harvester";

export const roles = {
    harvester: {
        name: "harvester" as const,
        targetPopulation: 8,
        behavior: harvester,
        bodies: [
            [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], // 1/2
            [WORK, WORK, CARRY, CARRY, MOVE, MOVE], // 1/4
            [WORK, CARRY, MOVE], // 0
        ],
    },
    builder: {
        name: "builder" as const,
        targetPopulation: 6,
        behavior: builder,
        bodies: [
            [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
            [WORK, CARRY, CARRY, MOVE, MOVE],
            [WORK, CARRY, MOVE],
        ],
    },
};


export type AvailableRoles = keyof typeof roles;
