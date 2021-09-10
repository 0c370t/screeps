import type {BehaviorFunction} from "./types";

/**
 * @returns true if creep did work
 */
function mine(creep: Creep): boolean {
    if (creep.store.getFreeCapacity() === 0) {
        creep.memory.task = "";
        return false;
    }
    const sources = creep.room.find(FIND_SOURCES);
    if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0]);
    }
    return true;
}

function depositAtSpawner(creep: Creep): boolean {
    if (creep.store.getFreeCapacity() === creep.store.getCapacity()) {
        creep.memory.task = "";
        return false;
    }
    const spawn = Game.spawns.Spawn1;
    switch (creep.transfer(spawn, RESOURCE_ENERGY)) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(spawn);
            return true;
        case ERR_FULL:
            return false;
        default: return true;
    }
}

function depositAtRoomController(creep: Creep): boolean {
    if (creep.store.getFreeCapacity() === creep.store.getCapacity()) {
        creep.memory.task = "";
        return false;
    }
    const controller = Game.rooms.W8N3.controller;
    if (controller) {
        const attempt = creep.transfer(controller, RESOURCE_ENERGY);
        if (attempt === ERR_NOT_IN_RANGE) creep.moveTo(controller);
    }
    return true;
}

export const harvester: BehaviorFunction = (creep: Creep) => {
    // First try to mine
    if (creep.memory.task === "mine" || (creep.memory.task === "" && creep.store.getFreeCapacity() > 0)) {
        // Can collect materials
        creep.memory.task = "mine";
        if (mine(creep)) return;
    }
    // Then try to drop some off
    const spawn = Game.spawns.Spawn1;
    if (creep.memory.task === "depositAtSpawn" || (creep.memory.task === "" && spawn.store.getFreeCapacity(RESOURCE_ENERGY))) {
        creep.memory.task = "depositAtSpawn";
        if (depositAtSpawner(creep)) return;
    }
    // Then try to drop it off at the room controller
    creep.memory.task = "depositAtRoomController";
    depositAtRoomController(creep);
    
};

