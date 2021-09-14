import type {Role} from "../../../creep_behaviors/roles";
import type {Step, StepType} from "../../../creep_behaviors/steps";

export interface DirectiveTemplate {
    /**
     * List of roles that can accept this directive
     */
    roles: Role[];

    /**
     * Steps required to complete the directive
     */
    steps: StepType[];
}

export interface Directive {
    /**
     * Steps required to complete the directive
     */
    steps: Array<Step<unknown>>;
    /**
     * Index of steps the creep is currently on
     */
    currentStepIndex: number;
    
    /**
     * List of roles that can accept this directive
     */
    roles: Role[];

}
