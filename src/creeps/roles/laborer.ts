import type {Role} from "./types";

export const laborer: Role = {
    defaultBody: [WORK, CARRY, MOVE],
    extraPart: [MOVE, MOVE, CARRY, WORK],
    targetPopulation: 8,
};
