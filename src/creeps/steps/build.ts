import type {VirtualCreep} from "../../virtuals/VirtualCreep";
import type {BuildStep, StepFunction} from "./types";
import {StepStatus} from "./types";

export const build: StepFunction<BuildStep> = (c: VirtualCreep, step: BuildStep) => {
    if (c.creep.store.getUsedCapacity() === 0) {
        c.stepComplete();
        return StepStatus.DONE;
    }

    const target = Game.getObjectById(step.target);
    if (!target || target.progress === undefined) {
        c.log(`Build target missing or of wrong type`);
        return StepStatus.ERROR;
    }

    const status = c.creep.build(target);
    switch (status) {
        case OK:
            return StepStatus.WORKING;
        case ERR_NO_BODYPART:
            c.log(`Missing required body part to complete task`);
            return StepStatus.ERROR;
        case ERR_NOT_IN_RANGE: {
            const movementStatus = c.moveTo(target.pos);
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
