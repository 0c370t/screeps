import {WorkStatus} from "./types";

export function maintain(creep: Creep): WorkStatus {
    if (!creep.memory.task) creep.memory.task = "maintain";

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

    switch (creep.repair(destintation)) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(destintation);
            return WorkStatus.WORKING;
        case ERR_NOT_ENOUGH_ENERGY:
        case ERR_NOT_ENOUGH_RESOURCES:
            return WorkStatus.DONE;
        
        default: return WorkStatus.WORKING;
    }
}
