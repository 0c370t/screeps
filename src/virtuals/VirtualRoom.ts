import {census} from "../creeps/census";
import type {AvailableDirective} from "../creeps/directives/types";
import type {RoleType} from "../creeps/roles";
import {VirtualCreep} from "./VirtualCreep";

export class VirtualRoom {
    constructor(public room: Room) {}

    get sources() { return this.room.find(FIND_SOURCES) }

    get availableEnergy() { return this.room.energyAvailable }

    get level() { return this.room.controller?.level ?? 0 }

    get spawns(): StructureSpawn[] { return this.room.find(FIND_MY_SPAWNS) }

    get availableSpawn(): StructureSpawn | false {
        return this.spawns.find(s => !s.spawning) ?? false;
    }

    get name() { return this.room.name }

    get directives() {
        if (!this.room.memory.directives) this.room.memory.directives = {};
        return Object.values(this.room.memory.directives);
    }

    private get directiveHashes() {
        if (!this.room.memory.directives) this.room.memory.directives = {};
        return Object.keys(this.room.memory.directives);
    }

    addDirective(d: AvailableDirective) {
        const serial = d.steps.reduce((p, c) => `${p}|${c.type}->${c.target}`, "");
        if (!this.directiveHashes.includes(serial)) {
            this.room.memory.directives![serial] = d;
        }
    }

    get creepsByRole(): Record<RoleType, VirtualCreep[]> {
        const roomCreeps = this.room.find(FIND_MY_CREEPS);
        return roomCreeps.reduce<Record<RoleType, VirtualCreep[]>>((c, p) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!c[p.memory.role]) {
                c[p.memory.role] = [];
            }
            c[p.memory.role].push(new VirtualCreep(p));
            return c;
            // @ts-expect-error the reduce function will add all needed keys to this record.
        }, {}) as unknown as Record<RoleType, VirtualCreep[]>;
    }

    runCensus() {
        census(this);
    }
}
