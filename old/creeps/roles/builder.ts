import {tasks} from "../tasks";
import type {RoleBehavior} from "./types";

export const builder: RoleBehavior = (creep: Creep) => {
    if (creep.store.getUsedCapacity() === 0) {
        // TODO: Pull from containers if available first
        tasks.mine(creep);
    }

    const maintainence = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (s: Structure) => s.hits < s.hitsMax / 2,
    });

    if (maintainence) {
        creep.memory.destination = maintainence.id;
        tasks.maintain(creep);
    }

    tasks.build(creep);
};
