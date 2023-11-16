export const loop = () => {
    for (const [name, creep] of Object.entries(Game.creeps)) {
        console.log(creep.name)
    }
}