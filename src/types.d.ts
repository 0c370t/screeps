// eslint-disable-next-line spaced-comment
/// <reference types="screeps" />

import type {AvailableRoles} from "./roles";
import type {AvailableTasks} from "./tasks";

declare global {
    interface CreepMemory {
        role: AvailableRoles;
        task?: AvailableTasks;
        targetSource?: Id<Source>;
        targetConSite?: Id<ConstructionSite>;
        desintation?: Id<OwnedStructure>;
    }
    interface RoomMemory {
        sourceAttentions: Record<string, number>;
    }
}
