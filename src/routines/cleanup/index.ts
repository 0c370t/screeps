import {cleanMemory} from "./clean_memory";

export function cleanup() {
    if (Game.time % 50 === 0) {
        cleanMemory();
    }
}
