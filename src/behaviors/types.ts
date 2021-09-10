export type BehaviorFunction = (c: Creep) => unknown;

export interface Behavior {
    name: string;
    targetPopulation: number;
    behavior: BehaviorFunction;
    body: BodyPartConstant[];
}
