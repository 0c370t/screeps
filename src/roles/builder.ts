import {build} from "../tasks/build";
import {mine} from "../tasks/mine";
import type {RoleBehavior} from "./types";

export const builder: RoleBehavior = (creep: Creep) => {
    if (creep.store.getUsedCapacity() === 0) {
        // TODO: Pull from containers if available first
        mine(creep);
    }
    // TODO: Maintainence

    build(creep);
};
