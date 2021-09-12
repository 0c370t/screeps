import {
    tasks,
} from "../tasks";
import type {RoleBehavior} from "./types";

export const harvester: RoleBehavior = (creep: Creep) => {
    // First try to mine
    if (creep.store.getFreeCapacity() > 0) {
        // Can collect materials
        tasks.mine(creep);
        return;
    }

    // Then try to deposit in spawner
    const spawn = Game.spawns.Spawn1;
    if (spawn.store.getFreeCapacity(RESOURCE_ENERGY)) {
        creep.memory.destination = spawn.id;
        tasks.deposit(creep);
        return;
    }

    const controller = creep.room.controller;
    if (controller) {
        if (controller.ticksToDowngrade < 15000) {
            creep.memory.destination = controller.id;
            tasks.deposit(creep);
            return;
        }
    }

    const validContainers = [
        "extension",
        "container",
    ];
    const closestContainer = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: s => validContainers.includes(s.structureType) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
    });
    if (closestContainer) {
        creep.memory.destination = closestContainer.id;
        tasks.deposit(creep);
        return;
    }


    const tower: StructureTower | null = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === "tower",
    });
    if (tower?.store.getFreeCapacity(RESOURCE_ENERGY)) {
        creep.memory.destination = tower.id;
        tasks.deposit(creep);
        return;
    }

    if (controller) {
        creep.memory.destination = controller.id;
        tasks.deposit(creep);
        return;
    }

    creep.say("oopsie");
};

