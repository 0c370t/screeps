import {CreepPathStyle} from "../../../constants";
import type {StepFunction} from ".";
import {StepStatus} from ".";

export const mine: StepFunction<Source> = (creep, step): StepStatus => {
    const target: Source | null = Game.getObjectById(step.target);

    if (target === null || typeof target.energy !== "number") {
        console.log("Invalid Target!");
        // Abort this directive
        return StepStatus.ERROR;
    }
    if (creep.store.getFreeCapacity() === 0) {
        // Creep has filled up
        creep.say("⛏️✅");
        return StepStatus.COMPLETE;
    }
    const status = creep.harvest(target);
    switch (status) {
        case OK:
        case ERR_NOT_ENOUGH_ENERGY:
        case ERR_BUSY:
            return StepStatus.INCOMPLETE;
        case ERR_NOT_FOUND:
            return StepStatus.ERROR;
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target, {visualizePathStyle: CreepPathStyle});
            return StepStatus.INCOMPLETE;
        default:
            console.log(`Unexpected status code ${status} found`);
            return StepStatus.ERROR;
    }
};
