import type {VirtualCreep} from "../../virtuals/VirtualCreep";

export enum StepStatus {
    WORKING = "WORKING",
    DONE = "DONE",
    ERROR = "ERROR",
}

export interface Step<T> {
    type: string;
    target: Id<T>;
}
export interface MiningStep extends Step<Source | undefined> {
    type: "mine";
}

export interface DepositStep extends Step<Structure & {store: Store<RESOURCE_ENERGY, false>} | undefined> {
    type: "deposit";
}

export type StepFunction<T extends Step<H>, H = unknown> = (c: VirtualCreep, s: T) => StepStatus;