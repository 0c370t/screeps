export type TaskFunction = (creep: Creep) => boolean;

export interface Task {
    name: string;
    behavior: TaskFunction;
}

export enum WorkStatus {
    DONE = 1,
    WORKING = 0,
}
