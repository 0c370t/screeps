// eslint-disable-next-line spaced-comment
/// <reference types="screeps" />

import type {Role} from "./routines/creep_behaviors/roles";
import type {Step} from "./routines/creep_behaviors/steps";
import type {AvailableDirective, Directive} from "./routines/room_management/directive_generation/directives/types";

export {};

declare global {
    
    interface CreepMemory {
        role: Role;
        step?: Step<unknown>;
        directive?: Directive;
    }
    interface RoomMemory {
        availableDirectives?: Record<string, AvailableDirective>;
    }
    interface Memory {
        threads: Record<string, CallableFunction>;
    }
    interface RegeneratorRuntime {
        deserializeGenerator: CallableFunction;
        serializeGenerator: CallableFunction;
    }
    const regeneratorRuntime: RegeneratorRuntime;
}

