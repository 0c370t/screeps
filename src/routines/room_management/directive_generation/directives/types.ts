import type {Priority} from "../../../../constants";
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

interface DirectiveCore {
    /**
     * Steps required to complete the directive
     */
    steps: Array<Step<unknown>>;
}

export interface Directive extends DirectiveCore {
    /**
     * Index of steps the creep is currently on
     */
    currentStepIndex: number;
}

export interface AvailableDirective extends DirectiveCore {
    /**
     * Number of times this directive can still be accepted
     */
    available: number;

    /**
     * List of roles that can accept this directive
     */
    roles: Role[];

    /**
     * Priority of the directive, larger numbers are higher priority
     */
    priority: Priority;
}
