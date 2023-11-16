import { DEFAULT_MOVE_OPTS } from "../constants";
import { finishTask } from "./utils";

export const depositTask = (creep: Creep, target: StructureStorage | StructureController) => {
    
    const r = creep.transfer(
        target,
        RESOURCE_ENERGY
    )
    switch (r) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target, DEFAULT_MOVE_OPTS);
            break;
        case OK:
        case ERR_NOT_ENOUGH_ENERGY:
            creep.speak(`Depositing (${creep.store.getUsedCapacity()} / ${creep.store.getCapacity()})`)
            if (creep.store.getUsedCapacity() === 0) {
                // All done
                finishTask(creep)
            }
            break;
        default:
            creep.speak("Unhandled deposit status", r)
    }
}