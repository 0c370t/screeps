import {Priority} from "../../../../constants";
import type {AvailableDirective, DirectiveTemplate} from "./types";

export const CollectEnergyDirective: DirectiveTemplate = {
    roles: ["harvester"],
    steps: ["mine", "deposit"],
};

export const createCollectEnergyDirective = (source: Id<Source>, container: Id<Structure>, available: number): AvailableDirective => ({
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
    available: available,
    priority: Priority.NORMAL,
});
