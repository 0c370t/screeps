// eslint-disable-next-line spaced-comment
/// <reference types="screeps" />

import type {AcceptedDirective, AvailableDirective} from "./creeps/directives/types";
import type {RoleType} from "./creeps/roles";


declare global {
    interface CreepMemory {
        directive?: AcceptedDirective;
        role: RoleType;
    }
    interface RoomMemory {
        taskedSources?: Record<Id<Source>, Array<Id<Creep>>>;
        directives?: Record<string, AvailableDirective>;
        naturalCenter?: {x: number; y: number;};
    }

    type RoomLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

    type PartialRecord<K extends keyof any, T> = {
        [P in K]?: T;
    };
}
