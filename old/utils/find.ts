export const findMaintainableBuildings = (room: Room) => room.find(
    FIND_STRUCTURES,
    {
        filter: s => (s.hits < s.hitsMax / 2 && s.structureType !== "constructedWall") || s.hits < 15000,
    },
).sort((a, b) => (a.hits / a.hitsMax) - (b.hits / b.hitsMax));
