import {behaviors} from "./behaviors";
import {instincts} from "./behaviors/instincts";
import {census} from "./census";

export const loop = () => {
    if (Game.time % 10 === 0) {
        census();
    }

    for (const creep of Object.values(Game.creeps)) {
        if (!creep.ticksToLive || creep.ticksToLive < 5) {
            creep.suicide();
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete Memory.creeps[creep.name];
            continue;
        }
        const behavior = behaviors[Memory.creeps[creep.name].role];
        if (instincts(creep)) {
            continue;
        } else {
            behavior.behavior(creep);
        }
        
    }
};
