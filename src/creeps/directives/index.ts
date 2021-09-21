import type {AvailableDirective} from "./types";

export const serializeDirective = (d: AvailableDirective) => d.steps.map(c => `${c.type}->${c.target}`).join("|");
