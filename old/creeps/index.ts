import {roles} from "./roles";
import {tasks} from "./tasks";
import {instincts} from "./tasks/instincts";
import {WorkStatus} from "./tasks/types";

export const creepBehavior = () => {
    for (const creep of Object.values(Game.creeps)) {
        if (instincts(creep)) {
            console.log("Instincts bby");
            continue;
        }
        
        if (creep.memory.task) {
            creep.say(creep.memory.task);
            const status = tasks[creep.memory.task](creep);
            
            if (status === WorkStatus.WORKING) continue;
            creep.memory.task = undefined;
        } else {
            creep.say("I'm bored!");
        }
        
        roles[creep.memory.role].behavior(creep);
    }
};
