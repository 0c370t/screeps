import {WorkStatus} from "./types";

export function depositAtExtension(creep: Creep): WorkStatus {
    if (creep.memory.task === undefined) creep.memory.task = "depositAtExtension";
    
    if (creep.store.getFreeCapacity() === creep.store.getCapacity()) {
        // Creep has finished task
        creep.memory.task = undefined;
        return WorkStatus.DONE;
    }
    
    const closestExtension = creep.memory.desintation
        ? Game.getObjectById(creep.memory.desintation)
        : creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: s => s.structureType === "extension" && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
        });
    if (!closestExtension) {
        creep.memory.task = undefined;
        creep.memory.desintation = undefined;
        return WorkStatus.DONE;
    }

    switch (creep.transfer(closestExtension, RESOURCE_ENERGY)) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(closestExtension);
            return WorkStatus.WORKING;
        case ERR_FULL:
            return WorkStatus.DONE;
        default: return WorkStatus.WORKING;
    }
}
