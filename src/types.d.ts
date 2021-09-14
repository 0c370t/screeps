// eslint-disable-next-line spaced-comment
/// <reference types="screeps" />

import type {RoutineName} from "./routines";
import { Role } from "./routines/creep_behaviors/roles";

export {};

declare global {
    
    interface CreepMemory {
        role: Role;
    }
    interface RoomMemory {
    }
    interface Memory {
        threads?: Record<RoutineName, any>;
    }
    interface RegeneratorRuntime {
        deserializeGenerator: CallableFunction;
        serializeGenerator: CallableFunction;
    }
    const regeneratorRuntime: RegeneratorRuntime;
}

