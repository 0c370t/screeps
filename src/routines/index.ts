import {cleanup} from "./cleanup";
import {creep_behaviors} from "./creep_behaviors";
import {room_management} from "./room_management";

export const routines = {
    room_management: room_management,
    creep_behaviors: creep_behaviors,
    cleanup: cleanup,
};

export type RoutineName = keyof typeof routines;

export function executeThread(title: string) {
    let thread;
    if (Memory.threads[title]) {
        try {
            thread = regeneratorRuntime.deserializeGenerator(Memory.threads[title]);
        } finally {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete Memory.threads[title];
        }
    } else {
        thread = routines[title]();
    }
    const result = thread.next();
    if (!result.done) {
        Memory.threads[title] = regeneratorRuntime.serializeGenerator(thread);
    }
}
