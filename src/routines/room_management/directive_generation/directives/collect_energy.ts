import type {Directive, DirectiveTemplate} from "./types";

export const CollectEnergyDirective: DirectiveTemplate = {
    roles: ["harvester"],
    steps: ["mine", "deposit"],
};

export const createCollectEnergyDirective = (source: Id<Source>, container: Id<Structure>): Directive => ({
    roles: CollectEnergyDirective.roles,
    steps: [
        {
            type: "mine",
            target: source,
        },
        {
            type: "deposit",
            target: container,
        },
    ],
    currentStepIndex: 0,
});
