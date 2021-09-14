import type {Directive} from "./types";
export * from "./types";

const hashDirective = (d: Directive): string => `${d.steps.map(s => `${s.type}-${s.target}`)}`;

export const addDirectiveToRoom = (r: Room, d: Directive, count: number) => {
    const hash = hashDirective(d);
    if (!Object.keys(r.memory.availableDirectives!).includes(hash)) {
        r.memory.availableDirectives![hash] = Array<Directive>(count).fill(d);
    } else {
        console.log(`Skipping ${hash}`);
    }
};
