// eslint-disable-next-line spaced-comment
/// <reference types="screeps" />

declare type TaskId = Id<Resource | Source | StructureController>

declare interface CreepMemory {
    room: Room["name"];
    role: string;
    task?: TaskId
}

declare interface RoomMemory {
    // Record of "thing" to "creep"
    tasks: Record<TaskId, (Creep["name"] | null)[]>
}
