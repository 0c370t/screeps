import {
    tasks,
} from "../tasks";
import type {RoleBehavior} from "./types";

export const harvester: RoleBehavior = (creep: Creep) => {
    // First try to mine
    if (creep.store.getFreeCapacity() > 0) {
        // Can collect materials
        creep.memory.task = "mine";
        if (tasks.mine(creep)) return;
    }

    // Then try to deposit in spawner
    const spawn = Game.spawns.Spawn1;
    if (spawn.store.getFreeCapacity(RESOURCE_ENERGY)) {
        creep.memory.task = "depositAtSpawner";
        if (tasks.depositAtSpawner(creep)) return;
    }

    // Then try to deposit at room controller
    creep.memory.task = "depositAtRoomController";
    tasks.depositAtRoomController(creep);
    
};

