import type {VirtualCreep} from "../../virtuals/VirtualCreep";
import type {
    MiningStep, StepFunction,
} from "./types";
import {StepStatus} from "./types";

export const mine: StepFunction<MiningStep> = (c: VirtualCreep, step: MiningStep) => {
    // Register the creep for work if it is not already
    if (!c.roomMemory.taskedSources) c.roomMemory.taskedSources = {};
    if (!c.roomMemory.taskedSources[step.target]) c.roomMemory.taskedSources[step.target] = [];
    if (!c.roomMemory.taskedSources[step.target].includes(c.id)) c.roomMemory.taskedSources[step.target];

    if (c.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        // Announce task completion
        c.stepComplete();
        if (c.roomMemory.taskedSources[step.target]) {
            // Indicate that we are done working on the source
            c.roomMemory.taskedSources[step.target] = c.roomMemory.taskedSources[step.target].filter(id => id !== c.creep.id);
        }
        return StepStatus.DONE;
    }
    
    const target = Game.getObjectById(step.target);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!target || target.energyCapacity === undefined) {
        c.log(`Mining target missing or of wrong type`);
        return StepStatus.ERROR;
    }

    const status = c.creep.harvest(target);

    switch (status) {
        case OK:
            return StepStatus.WORKING;
        case ERR_NO_BODYPART:
            c.log(`Missing required body part to complete task`);
            return StepStatus.ERROR;
        case ERR_NOT_IN_RANGE: {
            const movementStatus = c.moveTo(target.pos, 1);
            if (movementStatus === ERR_NO_PATH) {
                c.log(`Unable to find a valid path!`);
                return StepStatus.ERROR;
            }
            return StepStatus.WORKING;
        }
        default:
            return StepStatus.WORKING;

    }
};
