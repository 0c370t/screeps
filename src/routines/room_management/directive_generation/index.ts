import {Priority} from "../../../constants";
import type {AvailableDirective} from "./directives";
import {addDirectiveToRoom} from "./directives";
import {createCollectEnergyDirective} from "./directives/collect_energy";

const containerTypes: StructureConstant[] = [
    "container",
    "storage",
    "extension",
];

const {findBestSource} = (() => {
    let targetCounts: Record<string, Record<Id<Source>, number>> = {};
    let tick = Game.time;
    const populateMemo = (r: Room): Record<Id<Source>, number> => {
        const sourceRecord = r.find(FIND_SOURCES).reduce((p: Record<Id<Source>, number>, c: Source) => {
            if (!p[c.id]) p[c.id] = 0;
            return p;
        }, {});
        const directives = r.memory.availableDirectives ?? {};
        const result = Object.values(directives).reduce((p: Record<Id<Source>, number>, c: AvailableDirective) => {
            c.steps.forEach(s => {
                if (p[s.target]) {
                    p[s.target] += 1;
                }
            });
            return p;
        }, sourceRecord);
        
        return result;
    };
    
    return {
        findBestSource: (r: Room): Id<Source> => {
            if (Game.time > tick + 10) {
                tick = Game.time;
                targetCounts = {};
            }

            if (targetCounts[r.name] === undefined) {
                targetCounts[r.name] = populateMemo(r);
            }
            const roomCounts = targetCounts[r.name];
            const mostAvailable = Math.min(...Object.values<number>(targetCounts[r.name]));
            const id = Object.entries<number>(roomCounts).find(([, count]) => count === mostAvailable);
            if (!id) throw new Error();
            targetCounts[r.name][id[0]] += 1;
            return id[0] as Id<Source>;
        },
    };
})();


export const directiveGeneration = (room: Room) => {
    if (!room.memory.availableDirectives) room.memory.availableDirectives = {};

    // Attempt to fill spawn
    const spawns = room.find(FIND_MY_SPAWNS);
    spawns.forEach(s => {
        if (s.store.getFreeCapacity(RESOURCE_ENERGY)) {
            const directive = createCollectEnergyDirective(findBestSource(room), s.id, 2);
            addDirectiveToRoom(room, directive);
        }
    });

    // Attempt to fill containers
    const containers: Array<StructureContainer | StructureStorage | StructureExtension> = room.find(FIND_STRUCTURES, {
        filter: s => containerTypes.includes(s.structureType),
    })!;
    if (containers.length) {
        containers.forEach(c => {
            if (c.store.getFreeCapacity(RESOURCE_ENERGY)) {
                const directive = createCollectEnergyDirective(findBestSource(room), c.id, 2);
                addDirectiveToRoom(room, directive);
            }
        });
    } else {
        // If there are no containers, but there are container sites, create a different build job
        const containerSites = room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: f => containerTypes.includes(f.structureType),
        });
        if (containerSites.length) {
            containerSites.forEach(cs => {
                addDirectiveToRoom(room, {
                    roles: ["harvester", "builder"],
                    steps: [
                        {
                            target: findBestSource(room),
                            type: "mine",
                        },
                        {
                            target: cs.id,
                            type: "build",
                        },
                    ],
                    available: 4,
                    priority: Priority.HIGH,
                });
            });

        }
    }

    const collectOrMine = containers.length
        ? {
                type: "collect" as const,
                target: containers[0].id,
            }
        : {
                type: "mine" as const,
                target: findBestSource(room),
            };

    // Attempt to build structures
    const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
    sites.forEach(s => {
        if (s.progress < s.progressTotal) {
            const directive: AvailableDirective = {
                roles: ["builder"],
                steps: [collectOrMine, {
                    type: "build",
                    target: s.id,
                } ],
                available: 2,
                priority: Priority.HIGH,
            };
            addDirectiveToRoom(room, directive);
        }
    });

    const controller = room.controller;
    if (controller) {
        const controllerDirective: AvailableDirective = {
            roles: ["builder", "harvester"],
            steps: [collectOrMine, {
                type: "deposit",
                target: controller.id,
            } ],
            available: 4,
            priority: controller.ticksToDowngrade < CONTROLLER_DOWNGRADE[controller.level] / 2 ? Priority.HIGH : Priority.LOW,
        };
        addDirectiveToRoom(room, controllerDirective);
    }
};
