import {harvester} from "./harvester";
import type {Behavior} from "./types";

export const behaviors: Record<string, Behavior> = {
    harvester: {
        name: "harvester",
        targetPopulation: 4,
        behavior: harvester,
        body: [WORK, CARRY, MOVE],
    },
};
