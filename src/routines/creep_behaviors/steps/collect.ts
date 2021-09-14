import type {StepFunction} from ".";
import {StepStatus} from ".";

export const collect: StepFunction<Structure> = (creep: Creep, step): StepStatus => {
    const target: Structure | null = Game.getObjectById(step.target);
    
    if (target === null || !Object.keys(target).includes("store")) {
        console.log("Invalid Target!");
        return StepStatus.ERROR;
    }

    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        creep.say("👌");
        return StepStatus.COMPLETE;
    }

    const status = creep.withdraw(target, RESOURCE_ENERGY);
    
    switch (status) {
        case OK:
            return StepStatus.INCOMPLETE;
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            return StepStatus.INCOMPLETE;
        case ERR_NOT_ENOUGH_ENERGY:
            return StepStatus.COMPLETE;
        case ERR_INVALID_TARGET:
            return StepStatus.ERROR;
        default:
            console.log(`Unexpected status code ${status} found`);
            return StepStatus.ERROR;
    }

};
