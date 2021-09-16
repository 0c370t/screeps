import type {Role} from "./types";

export const laborer: Role = {
    defaultBody: [WORK, CARRY, MOVE],
    extraPart: [WORK, CARRY, MOVE],
    maxPartLookup: {
        0: 0,
        1: 3,
        2: 6,
        3: 9,
        4: 12,
        5: 15,
        6: 18,
        7: 24,
        8: 30,
    },
    targetPopulation: 8,
};
