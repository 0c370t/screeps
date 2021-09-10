import type {BehaviorFunction} from "./types";

export const harvester: BehaviorFunction = (creep: Creep) => {
    if (creep.store.getFreeCapacity() > 0) {
        // Can collect materials
        const sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0]);
        }
    } else {
        const spawn = Game.spawns.Spawn1;
        switch (creep.transfer(spawn, RESOURCE_ENERGY)) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(spawn);
                break;
            case OK:
                break;
            case ERR_FULL: {
                const controller = Game.rooms.W8N3.controller;
                if (controller) {
                    const attempt = creep.transfer(controller, RESOURCE_ENERGY);
                    if (attempt === ERR_NOT_IN_RANGE) creep.moveTo(controller);
                }
                break;
            }
            default:
                console.log("Unknown error code found!");
        }
    }
};

