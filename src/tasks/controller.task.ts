import { finishTask } from "./utils";

export const controllerTask = (creep: Creep, target: StructureController) => {
    
    const r = creep.transfer(
        target,
        RESOURCE_ENERGY
    )
    switch (r) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            break;
        case OK:
            if (creep.store.getUsedCapacity() === 0) {
                // All done
                finishTask(creep)
            }
            break;
    }
}