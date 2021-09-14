import type {Step} from "../../creep_behaviors/steps";

export interface DirectiveStep<T> {
    step: Step<T>;
}
