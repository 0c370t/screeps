import {roles} from "./roles";
import {tasks} from "./tasks";
import {instincts} from "./tasks/instincts";
import {WorkStatus} from "./tasks/types";
import {census} from "./utils/census";
import {cleanMemory} from "./utils/clean_memory";
import {cleanTombs} from "./utils/clean_tombs";

export const loop = () => {
    if (Game.time % 10 === 0) {
        census();
    }
    if (Game.time % 50 === 0) {
        cleanMemory();
    }

    if (Game.time % 5 === 0) {
        cleanTombs();
    }

    for (const creep of Object.values(Game.creeps)) {
        
        if (instincts(creep)) {
            continue;
        }
        if (creep.memory.task) {
            const status = tasks[creep.memory.task](creep);
            
            if (status === WorkStatus.WORKING) continue;
            creep.memory.task = undefined;
        }
        
        roles[creep.memory.role].behavior(creep);
    }
};
