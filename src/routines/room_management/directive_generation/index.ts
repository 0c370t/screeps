import {addDirectiveToRoom} from "./directives";
import {createCollectEnergyDirective} from "./directives/collect_energy";

const containerTypes: StructureConstant[] = [
    "container",
    "storage",
];


export const directiveGeneration = (room: Room) => {
    const sources = room.find(FIND_SOURCES);
    // Attempt to fill spawn
    const spawns = room.find(FIND_MY_SPAWNS);
    spawns.forEach(s => {
        if (s.store.getFreeCapacity(RESOURCE_ENERGY)) {
            const directive = createCollectEnergyDirective(sources[0].id, s.id);
            addDirectiveToRoom(room, directive, 4);
        }
    });

    // Attempt to fill containers
    const containers = room.find(FIND_STRUCTURES, {
        filter: s => containerTypes.includes(s.structureType),
    })!;
    if (containers.length) {
        containers.forEach(c => {
            if (c.store?.getFreeCapacity(RESOURCE_ENERGY)) {
                const directive = createCollectEnergyDirective(sources[0].id, c.id);
                addDirectiveToRoom(room, directive, 4);
            }
        });
    } else {
        const containerSites = room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: f => containerTypes.includes(f.structureType),
        });
        if (containerSites.length) {
            containerSites.forEach(cs => {
                addDirectiveToRoom(room, {
                    roles: ["harvester", "builder"],
                    steps: [
                        {
                            target: sources[0].id,
                            type: "mine",
                        },
                        {
                            target: cs.id,
                            type: "build",
                        },
                    ],
                    currentStepIndex: 0,
                }, 4);
            });

        }
    }
};
