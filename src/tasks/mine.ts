import {WorkStatus} from "./types";

function getTarget(creep: Creep): Source {
    const roomMem = creep.room.memory;
    // Do not trust memory
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!roomMem.sourceAttentions) roomMem.sourceAttentions = {};

    let target: Source | undefined;
    if (creep.memory.targetSource) {
        const found = Game.getObjectById(creep.memory.targetSource);
        if (found) {
            target = found;
        }
    }
    if (!target) {
        const sources = creep.room.find(FIND_SOURCES);
        let min = Number.MAX_SAFE_INTEGER;
        // default to first source
        let found = sources[0];
        sources.forEach(s => {
            if (!roomMem.sourceAttentions[s.id]) {
                roomMem.sourceAttentions[s.id] = 0;
            }
            if (roomMem.sourceAttentions[s.id] < min) {
                found = s;
                min = roomMem.sourceAttentions[s.id];
            }
        });
        creep.memory.targetSource = found.id;
        roomMem.sourceAttentions[found.id] += 1;
        target = found;
    }
    return target;
}

export function mine(creep: Creep): WorkStatus {
    if (creep.memory.task !== "mine") creep.memory.task = "mine";
    const roomMem = creep.room.memory;
    const target = getTarget(creep);
    
    if (creep.store.getFreeCapacity() === 0) {
        creep.memory.targetSource = undefined;
        roomMem.sourceAttentions[target.id] -= 1;
        if (roomMem.sourceAttentions[target.id] < 0) roomMem.sourceAttentions[target.id] = 0;
        return WorkStatus.DONE;
    }


    if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
    }
    return WorkStatus.WORKING;
}
