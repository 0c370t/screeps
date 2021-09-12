import {WorkStatus} from "./types";

export function deposit(creep: Creep): WorkStatus {
    if (!creep.memory.task) creep.memory.task = "deposit";

    if (!creep.memory.destination) {
        creep.memory.task = undefined;
        return WorkStatus.DONE;
    }

    const destintation = Game.getObjectById(creep.memory.destination);

    if (!destintation) {
        creep.memory.task = undefined;
        creep.memory.destination = undefined;
        return WorkStatus.DONE;
    }

    switch (creep.transfer(destintation, RESOURCE_ENERGY)) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(destintation);
            return WorkStatus.WORKING;
        case ERR_FULL:
        case ERR_NOT_ENOUGH_ENERGY:
        case ERR_NOT_ENOUGH_RESOURCES:
            return WorkStatus.DONE;
        
        default: return WorkStatus.WORKING;
    }
}
