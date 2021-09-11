const log = (s: string) => { console.log(`MEMCLEAN | ${s}`) };

export const cleanMemory = () => {
    log("Cleaning Memory");
    const creepNames = Object.keys(Game.creeps);
    const toRemove: string[] = [];
    Object.keys(Memory.creeps).forEach(creepName => {
        if (!creepNames.includes(creepName)) {
            toRemove.push(creepName);
        }
    });
    log(`Deleting stale memory entries: ${JSON.stringify(toRemove)}`);
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    toRemove.forEach(name => delete Memory.creeps[name]);
}