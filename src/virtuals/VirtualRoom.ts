import {census} from "../creeps/census";
import {serializeDirective} from "../creeps/directives";
import type {AvailableDirective} from "../creeps/directives/types";
import type {RoleType} from "../creeps/roles";
import {findNaturalCenter} from "../utilities/find_natural_room_center";
import type {VirtualCreep} from "./VirtualCreep";
import {VirtualManager} from "./VirtualManager";

export class VirtualRoom {
    private _sortedDirectives: [number, AvailableDirective[]] = [-1, [] ];

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
        if (this._sortedDirectives[0] !== Game.time) {
            const rawDirs = Object.values(this.room.memory.directives);
            this._sortedDirectives = [Game.time, rawDirs.sort((a, b) => b.priority - a.priority)];
            this.log(`Sorting directives`);
        }
        return this._sortedDirectives[1];
    }

    get creeps() {
        return this.room.find(FIND_MY_CREEPS).map(c => VirtualManager.getVirtualCreep(c));
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
            c[p.memory.role].push(VirtualManager.getVirtualCreep(p));
            return c;
        // @ts-expect-error the reduce function will add all needed keys to this record.
        }, {}) as unknown as Record<RoleType, VirtualCreep[]>;
    }

    get naturalCenter(): {x: number; y: number;} {
        if (this.room.memory.naturalCenter) return this.room.memory.naturalCenter;
        const result = findNaturalCenter(this);
        this.room.memory.naturalCenter = result;
        return result;
    }

    addDirective(d: AvailableDirective) {
        const serial = serializeDirective(d);
        if (!this.directiveHashes.includes(serial)) {
            this.room.memory.directives![serial] = d;
        } else if (this.room.memory.directives![serial].priority !== d.priority) {
            this.room.memory.directives![serial] = d;
        }
    }

    findBestSource(pos: RoomPosition): Id<Source> | undefined {
        const allSources = this.sources; // getter for Room.find(FIND_SOURCES)
        const scores: Record<Id<Source>, number> = {};
        const taskedSources = this.room.memory.taskedSources ?? {};
        for (const source of allSources) {
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
            const weight = Math.floor(20 / Math.pow(1.1, pathLength / 2));
            score += weight;
            scores[source.id] = score;
        }

        let bestSource: Id<Source> | undefined,
            bestVal = Number.MIN_SAFE_INTEGER;
        for (const id in scores) {
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

    flagWorkTarget(c: VirtualCreep, t: Id<unknown>) {
        if (this.room.memory.taskedSources === undefined) this.room.memory.taskedSources = {};
        if (this.room.memory.taskedSources[t] === undefined) this.room.memory.taskedSources[t] = [];
        if (!this.room.memory.taskedSources[t].includes(c.id)) this.room.memory.taskedSources[t].push(c.id);
    }

    unflagWorkTarget(c: VirtualCreep, t: Id<unknown>) {
        if (this.room.memory.taskedSources === undefined) this.room.memory.taskedSources = {};
        if (this.room.memory.taskedSources[t] === undefined) this.room.memory.taskedSources[t] = [];
        if (this.room.memory.taskedSources[t].includes(c.id)) {
            this.room.memory.taskedSources[t] = this.room.memory.taskedSources[t].filter(ts => c.id !== ts);
        }
        // Do a sanity check
        const liveCreeps = c.room.creeps.map(_c => _c.id);
        this.room.memory.taskedSources[t] = this.room.memory.taskedSources[t].filter(ts => liveCreeps.includes(ts));
    }

    log(...args: Parameters<typeof console.log>) {
        console.log(`${this.name} | `, ...args);
    }
}
