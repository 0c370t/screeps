import type {VirtualCreep} from "../../virtuals/VirtualCreep";
import type {
    DepositStep, StepFunction,
} from "./types";
import {StepStatus} from "./types";

export const mine: StepFunction<DepositStep> = (c: VirtualCreep, step: DepositStep) => {
    if (c.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        // Announce task completion
        c.stepComplete();
        
        return StepStatus.DONE;
    }
    
    const target = Game.getObjectById(step.target);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!target || target.store === undefined) {
        console.log(`${c.creep.room.name} | Deposit target missing or of wrong type`);
        return StepStatus.ERROR;
    }

    const status = c.creep.transfer(target, RESOURCE_ENERGY);

    switch (status) {
        case OK:
            return StepStatus.WORKING;
        case ERR_NO_BODYPART:
            console.log(`${c.creep.name} | Missing required body part to complete task`);
            return StepStatus.ERROR;
        case ERR_NOT_IN_RANGE: {
            const movementStatus = c.moveTo(target.pos);
            if (movementStatus === ERR_NO_PATH) {
                console.log(`${c.creep.name} | Unable to find a valid path!`);
                return StepStatus.ERROR;
            }
            return StepStatus.WORKING;
        }
        default:
            return StepStatus.WORKING;

    }
};
