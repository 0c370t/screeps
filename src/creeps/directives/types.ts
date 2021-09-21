import type {Priority} from "../../constants";
import type {RoleType} from "../roles";
import type {Step} from "../steps/types";

export interface DirectiveCore {
    /**
     * Steps to take that will complete this directive
     */
    steps: Array<Step<unknown>>;
}

export interface AvailableDirective extends DirectiveCore {
    /**
     * Indicates how many times this directive can be worked before it expires
     */
    availableCount: number;

    /**
     * Roles that are allowed to complete this directive
     */
    roles: RoleType[];

    /**
     * Determines which order the directive should be picked up in
     */
    priority: Priority;
}

export interface AcceptedDirective extends DirectiveCore {
    /**
     * Step the creep is currently on
     */
    stepIndex: number;
}
