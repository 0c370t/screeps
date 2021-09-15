import type {AvailableDirective, Directive} from "./types";
export * from "./types";

export const hashDirective = (d: AvailableDirective): string => `${d.steps.map(s => `${s.type}-${s.target}`)}`;

export const addDirectiveToRoom = (r: Room, d: AvailableDirective) => {
    const hash = hashDirective(d);
    if (!Object.keys(r.memory.availableDirectives!).includes(hash)) {
        r.memory.availableDirectives![hash] = d;
    }
};

export const transformAvailableDirective = (d: AvailableDirective): Directive => ({
    steps: d.steps,
    currentStepIndex: 0,
});

export const {getDirectives, forceRememo} = (() => {
    let memo = {};
    let tick = Game.time;
    return {
        getDirectives: (r: Room): AvailableDirective[] => {
            if (tick !== Game.time) {
                memo = {};
                tick = Game.time;
            }
            if (!memo[r.name]) {
                const allDirectives = Object.values(r.memory.availableDirectives ?? {});
                memo[r.name] = allDirectives.sort((a, b) => a.priority - b.priority);
            }
            return memo[r.name];
        },
        forceRememo: (r: Room) => {
            const allDirectives = Object.values(r.memory.availableDirectives ?? {});
            memo[r.name] = allDirectives.sort((a, b) => a.priority - b.priority);
        },
    };
})();
