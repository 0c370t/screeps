import "screeps-regenerator-runtime/runtime";

import type {RoutineName} from "./routines";
import {routines} from "./routines";


function executeThread(title: RoutineName) {
    let thread;
    if (Memory.threads![title]) {
        try {
            thread = regeneratorRuntime.deserializeGenerator(Memory.threads![title]);
        } finally {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete Memory.threads![title];
        }
    } else {
        thread = routines[title]();
    }
    const result = thread.next();
    if (!result.done) {
        Memory.threads![title] = regeneratorRuntime.serializeGenerator(thread);
    }
}

export function loop() {
    if (!Memory.threads) Memory.threads = {"room_management": {}, "creep_behaviors": {} };
    executeThread("room_management");
    executeThread("creep_behaviors");
}
