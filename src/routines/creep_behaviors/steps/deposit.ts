import type {StepFunction} from ".";
import {StepStatus} from ".";

export const deposit: StepFunction<Structure> = (creep, step) => {
    const target: Structure | null = Game.getObjectById(step.target);
    
    if (target === null || !Object.keys(target).includes("store")) {
        console.log("Invalid Target!");
        return StepStatus.ERROR;
    }

    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        creep.say("👌");
        return StepStatus.COMPLETE;
    }

    const status = creep.transfer(target, RESOURCE_ENERGY);
    
    switch (status) {
        case OK:
            return StepStatus.INCOMPLETE;
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            return StepStatus.INCOMPLETE;
        case ERR_FULL:
        case ERR_NOT_ENOUGH_ENERGY:
            return StepStatus.COMPLETE;
        case ERR_INVALID_TARGET:
        case ERR_NO_PATH:
            return StepStatus.ERROR;
        default:
            console.log(`Unexpected status code ${status} found`);
            return StepStatus.ERROR;
    }
};
