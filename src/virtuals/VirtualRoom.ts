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

    addDirective(d: AvailableDirective) {
        const serial = d.steps.map((c) => `${c.type}->${c.target}`).join("|");
        if (!this.directiveHashes.includes(serial)) {
            this.room.memory.directives![serial] = d;
        }
    }

    findBestSource(pos: RoomPosition): Id<Source> | undefined {
        const allSources = this.sources; // getter for Room.find(FIND_SOURCES)
        const scores: Record<Id<Source>, number> = {};
        const taskedSources = this.room.memory.taskedSources ?? {};
        for(const source of allSources) {
            let score = 0;
            if (source.id in taskedSources) {
                // Weight based on other creeps working on this source
                score -= taskedSources[source.id].length * 3;
            }
            // Weight based on proportion of available energy (0-10)
            score += Math.ceil((source.energy / source.energyCapacity) * 10);
            
            // Weight based on distance to target
            const pathLength = pos.findPathTo(source).length;
            // https://www.desmos.com/calculator/9fpwnvbeon
            const weight = Math.floor( 20 / Math.pow(1.1, pathLength / 2));
            score += weight;
            scores[source.id] = score;
        }

        let bestVal = Number.MIN_SAFE_INTEGER, bestSource: Id<Source> | undefined = undefined;
        for(const id in scores) {
            if (scores[id] > bestVal) {
                bestVal = scores[id];
                bestSource = id as Id<Source>;
            }
        }
        return bestSource;
    }

    runCensus() {
        census(this);
    }
}
