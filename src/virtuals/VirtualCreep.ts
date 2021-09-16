export class VirtualCreep {
    constructor(public creep: Creep) {}

    get roomMemory() { return this.creep.room.memory }

    get memory() { return this.creep.memory }

    get id() { return this.creep.id }

    stepComplete() {
        this.creep.say("✅");
    }

    hasBodyPart(part: BodyPartConstant) {
        return this.creep.getActiveBodyparts(part) > 0;
    }

    moveTo(target: RoomPosition) {
        return this.creep.moveTo(target);
    }
}
