import type {VirtualCreep} from "../../virtuals/VirtualCreep";
import type {
    DepositStep, StepFunction,
} from "./types";
import {StepStatus} from "./types";

export const deposit: StepFunction<DepositStep> = (c: VirtualCreep, step: DepositStep) => {
    if (c.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        // Announce task completion
        c.stepComplete();
        
        return StepStatus.DONE;
    }
    
    const target = Game.getObjectById(step.target as Id<AnyStoreStructure | StructureSpawn | StructureController>);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!target || (target.store === undefined && target.structureType !== "controller")) {
        c.log(`Deposit target missing or of wrong type`);
        return StepStatus.ERROR;
    }

    if (target.store && !target.store.getFreeCapacity(RESOURCE_ENERGY)) {
        c.log(`Target is already full; completing task`);
        c.stepComplete();
        return StepStatus.DONE;
    }

    const status = c.creep.transfer(target, RESOURCE_ENERGY);

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
        case ERR_FULL:
            return StepStatus.DONE;
        default:
            return StepStatus.WORKING;
    }
};
