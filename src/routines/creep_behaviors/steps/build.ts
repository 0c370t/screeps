import type {StepFunction} from ".";
import {StepStatus} from ".";

export const build: StepFunction<ConstructionSite> = (creep: Creep, step): StepStatus => {
    const target: ConstructionSite | null = Game.getObjectById(step.target);
    
    if (target === null || !target.progressTotal) {
        console.log("Invalid Target!");
        return StepStatus.ERROR;
    }

    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        creep.say("🔨✅");
        return StepStatus.COMPLETE;
    }

    const status = creep.build(target);
    
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
