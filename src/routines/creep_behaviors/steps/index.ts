import {build} from "./build";
import {collect} from "./collect";
import {deposit} from "./deposit";
import {mine} from "./mine";
import {repair} from "./repair";

export const steps = {
    mine,
    deposit,
    build,
    repair,
    collect,
};

export enum StepStatus {
    COMPLETE = 1,
    INCOMPLETE = 0,
    ERROR = -1,
}

export type StepFunction<T> = (creep: Creep, step: Step<T>) => StepStatus;

export type StepType = keyof typeof steps;

export interface Step<T> {
    type: StepType;
    target: Id<T>;
}

