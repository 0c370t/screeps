export const cleanTombs = () => {
    for (const room of Object.values(Game.rooms)) {
        const tombs = room.find(FIND_TOMBSTONES);
        for (const tomb of tombs) {
            // TODO: Perform any role cleanup.
            
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete Memory.creeps[tomb.creep.name];
        }
    }
};
