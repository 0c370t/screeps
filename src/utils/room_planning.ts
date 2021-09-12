const planRoads = (room: Room) => {
    const controller = room.controller;
    const sources = room.find(FIND_SOURCES);
    const nodes: RoomPosition[] = [];
    if (controller) {
        nodes.push(controller.pos);
    }
    sources.forEach(s => nodes.push(s.pos));
    const included_structures: StructureConstant[] = [
        "container",
        "extension",
        "spawn",
    ];
    const structures = room.find(FIND_MY_STRUCTURES, {
        filter: s => included_structures.includes(s.structureType),
    });
    structures.forEach(s => nodes.push(s.pos));

    const roadPositions: Set<RoomPosition> = new Set<RoomPosition>();

    nodes.forEach((n1, i) => {
        for (let j = i;j < nodes.length;j++) {
            const {path} = PathFinder.search(n1, {pos: nodes[j], range: 1});
            path.forEach(p => roadPositions.add(p));
        }
    });
    roadPositions.forEach(p => p.createConstructionSite(STRUCTURE_ROAD));
};

export const roomPlanning = () => {
    console.log("Executing Room Planning");
    for (const room of Object.values(Game.rooms)) {
        planRoads(room);
    }
};
