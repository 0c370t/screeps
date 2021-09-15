import {forceRememo, getDirectives, hashDirective, transformAvailableDirective} from "../room_management/directive_generation/directives";
import {steps, StepStatus} from "./steps";

export function creep_behaviors() {
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
            const directives = getDirectives(room);

            if (directives.length) {
                const availableDirective = directives.find(d => d.roles.includes(creep.memory.role));
                    
                if (availableDirective) {
                    const directive = transformAvailableDirective(availableDirective);
                    const directiveHash = hashDirective(availableDirective);
                    if (room.memory.availableDirectives?.[directiveHash] === undefined) {
                        console.log("Couldn't find hash in memory; something is screwy");
                        continue;
                    }
                    creep.memory.directive = directive;
                    
                    room.memory.availableDirectives[directiveHash].available -= 1;
                    if (room.memory.availableDirectives[directiveHash].available === 0) {
                        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                        delete room.memory.availableDirectives[directiveHash];
                        forceRememo(room);
                    }

                    continue;
                }
            }
            creep.say("No work");
            continue;
        }
    }
}
