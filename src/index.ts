import "screeps-regenerator-runtime/runtime";

import {routines} from "./routines";


export function loop() {
    routines.creep_behaviors();
    routines.room_management();
    routines.cleanup();
}
