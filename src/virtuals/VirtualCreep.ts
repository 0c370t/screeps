import type {AvailableDirective} from "../creeps/directives/types";
import {steps} from "../creeps/steps";
import {StepStatus} from "../creeps/steps/types";
import {VirtualRoom} from "./VirtualRoom";

export class VirtualCreep {
    private _room: VirtualRoom | undefined;

    constructor(public creep: Creep) {}

    get room() {
        if (!this._room) this._room = new VirtualRoom(this.creep.room);
        return this._room;
    }

    get roomMemory() { return this.creep.room.memory }

    get memory() { return this.creep.memory }

    get id() { return this.creep.id }

    get role() { return this.creep.memory.role }

    behave(room: VirtualRoom) {
        if (this.memory.directive) {
            const step = this.memory.directive.steps[this.memory.directive.stepIndex];
            if (!step) {
                this.creep.memory.directive = undefined;
                return;
            }
            const status = steps[step.type](this, step);
            switch (status) {
                case StepStatus.DONE:
                    this.memory.directive.stepIndex++;
                    if (this.memory.directive.stepIndex > this.memory.directive.steps.length) {
                        this.memory.directive = undefined;
                    }
                    this.room.unflagWorkTarget(this, step.target);
                    if (this.memory.directive!.steps[this.memory.directive!.stepIndex]) {
                        this.room.flagWorkTarget(this, this.memory.directive!.steps[this.memory.directive!.stepIndex].target);
                    }
                    break;
                case StepStatus.ERROR:
                    console.log(`Error encounteded while performing step ${JSON.stringify(step)}`);
                    this.memory.directive = undefined;
                    break;
                default:
                    break;
            }
        } else {
            const available = room.room.memory.directives;
            if (!available) {
                this.creep.say("No available work!");
                return;
            }
            const [hash, work]: [string | false, AvailableDirective | false] = Object.entries(available).find(([,a]) => a.roles.includes(this.role)) ?? [false, false];
            if (work !== false && hash !== false) {
                this.creep.memory.directive = {
                    steps: work.steps,
                    stepIndex: 0,
                };
                work.availableCount--;
                if (work.availableCount <= 0) {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete this.roomMemory.directives?.[hash];
                }
                this.room.flagWorkTarget(this, work.steps[0].target);
            } else {
                this.creep.say("No available work!");
            }
        }
    }

    stepComplete() {
        this.creep.say("✅");
    }

    hasBodyPart(part: BodyPartConstant) {
        return this.creep.getActiveBodyparts(part) > 0;
    }

    moveTo(target: RoomPosition, range: number = 0) {
        return this.creep.moveTo(target, {
            range,
        });
    }
}
