import {WorkStatus} from "./types";

export function depositAtSpawner(creep: Creep): WorkStatus {
    if (creep.memory.task === undefined) creep.memory.task = "depositAtSpawner";
    
    if (creep.store.getFreeCapacity() === creep.store.getCapacity()) {
        // Creep has finished task
        creep.memory.task = undefined;
        return WorkStatus.DONE;
    }

    const spawn = Game.spawns.Spawn1;
    switch (creep.transfer(spawn, RESOURCE_ENERGY)) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(spawn);
            return WorkStatus.WORKING;
        case ERR_FULL:
            return WorkStatus.DONE;
        default: return WorkStatus.WORKING;
    }
}
