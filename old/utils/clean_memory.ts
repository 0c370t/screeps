export const cleanMemory = () => {
    const creepNames = Object.keys(Game.creeps);
    const toRemove: string[] = [];
    Object.keys(Memory.creeps).forEach(creepName => {
        if (!creepNames.includes(creepName)) {
            toRemove.push(creepName);
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    toRemove.forEach(name => delete Memory.creeps[name]);
};
