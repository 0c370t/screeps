// eslint-disable-next-line spaced-comment
/// <reference types="screeps" />

declare interface CreepMemory {
    room: Room["name"];
    role: string;
    task?: Id<Resource | Source | StructureController>
}

declare interface RoomMemory {
    // Record of "thing" to "creep"
    tasks: Record<string, (Creep["name"] | null)[]>
}
