// eslint-disable-next-line spaced-comment
/// <reference types="screeps" />

import type {AvailableRoles} from "./creeps/roles";
import type {AvailableTasks} from "./creeps/tasks";

declare global {
    interface CreepMemory {
        role: AvailableRoles;
        task?: AvailableTasks;
        targetSource?: Id<Source>;
        targetConSite?: Id<ConstructionSite>;
        destination?: Id<OwnedStructure>;
    }
    interface RoomMemory {
        sourceAttentions: Record<string, number>;
    }
}
