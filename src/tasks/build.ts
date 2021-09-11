import {WorkStatus} from "./types";

function getTarget(creep: Creep): ConstructionSite | false {
    if (creep.memory.targetConSite) {
        const targetSite = Game.getObjectById(creep.memory.targetConSite);
        if (targetSite) return targetSite;
        creep.memory.targetConSite = undefined;
    }
    // Find construction site;
    const targetSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
    if (!targetSite) {
        // No sites found
        return false;
    }
    creep.memory.targetConSite = targetSite.id;
    return targetSite;
}


export const build = (creep: Creep): WorkStatus => {
    if (creep.memory.task === undefined) creep.memory.task = "build";

    const target = getTarget(creep);
    if (!target) return WorkStatus.DONE;
    const status = creep.build(target);
    switch (status) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            return WorkStatus.WORKING;
        case OK:
            return WorkStatus.WORKING;
        case ERR_NOT_ENOUGH_RESOURCES:
            return WorkStatus.DONE;
        default:
            console.log("Unknown Error Encountered!");
            creep.memory.targetConSite = undefined;
            return WorkStatus.DONE;
    }
};
