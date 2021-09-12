const behave = (tower: StructureTower) => {
    const enemies = tower.room.find(FIND_HOSTILE_CREEPS);
    if (enemies.length) {
        tower.attack(enemies[0]);
        return;
    }
    const buildings = tower.room.find(
        FIND_MY_STRUCTURES,
        {
            filter: s => s.hits < s.hitsMax / 2,
        },
    );

    if (buildings.length) {
        tower.repair(buildings[0]);
        return;
    }
};


export const towerBehavior = () => {
    Object.values(Game.rooms).forEach(room => {
        const towers = room.find(FIND_MY_STRUCTURES, {
            filter: s => s.structureType === "tower",
        });
        console.log(towers);
        towers.forEach(behave);
    });
};
