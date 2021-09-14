import {steps, StepStatus} from "./steps";

export function* creep_behaviors() {
    while (true) {
        for (const creep of Object.values(Game.creeps)) {
            if (creep.memory.directive) {
                const directive = creep.memory.directive;
                const step = directive.steps[directive.currentStepIndex];
                // @ts-expect-error Typescript is hard
                const status = steps[step.type](creep, step);
                
                switch (status) {
                    case StepStatus.COMPLETE:
                        creep.memory.directive.currentStepIndex += 1;
                        if (creep.memory.directive.currentStepIndex >= creep.memory.directive.steps.length) {
                            creep.memory.directive = undefined;
                        }
                        continue;
                    case StepStatus.INCOMPLETE:
                        continue;
                    case StepStatus.ERROR:
                        console.log(`Unable to complete directive! ${JSON.stringify(creep.memory.directive)}`);
                        creep.memory.directive = undefined;
                        continue;
                    default:
                        continue;
                }
            } else {
                const room = creep.room;
                if (room.memory.availableDirectives && Object.values(room.memory.availableDirectives).length) {
                    
                    const directives = Object.entries(room.memory.availableDirectives);
                    const di = directives.find(([, d]) => d[0].roles.includes(creep.memory.role));
                    
                    if (di) {
                        const directive = room.memory.availableDirectives[di[0]].pop();
                        creep.memory.directive = directive;
                        if (room.memory.availableDirectives[di[0]].length === 0) {
                            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                            delete room.memory.availableDirectives[di[0]];
                        }

                        continue;
                    }
                }
                creep.say("No work");
                continue;
            }
        }
        yield {};
    }
}
