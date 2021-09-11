import {WorkStatus} from "./types";

export function depositAtRoomController(creep: Creep): WorkStatus {
    if (creep.memory.task === undefined) creep.memory.task = "depositAtRoomController";

    if (creep.store.getFreeCapacity() === creep.store.getCapacity()) {
        // Creep has completed the task
        creep.memory.task = undefined;
        return WorkStatus.DONE;
    }

    const controller = creep.room.controller;
    if (controller) {
        const attempt = creep.transfer(controller, RESOURCE_ENERGY);
        if (attempt === ERR_NOT_IN_RANGE) creep.moveTo(controller);
    }
    return WorkStatus.WORKING;
}
