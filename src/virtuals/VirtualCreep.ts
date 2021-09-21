import {serializeDirective} from "../creeps/directives";
import type {AvailableDirective} from "../creeps/directives/types";
import {steps} from "../creeps/steps";
import {StepStatus} from "../creeps/steps/types";
import {VirtualManager} from "./VirtualManager";
import type {VirtualRoom} from "./VirtualRoom";

export class VirtualCreep {
    private _room: VirtualRoom | undefined;

    constructor(public creep: Creep) {}

    get room() {
        if (!this._room) this._room = VirtualManager.getVirtualRoom(this.creep.room);
        return this._room;
    }

    get roomMemory() { return this.creep.room.memory }

    get memory() { return this.creep.memory }

    get name() { return this.creep.name }

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
                    this.log(`Error encounteded while performing step ${JSON.stringify(step)}`);
                    this.memory.directive = undefined;
                    break;
                default:
                    break;
            }
        } else {
            const available = room.directives;
            if (!available.length) {
                this.creep.say("No available work!");
                return;
            }
            const work: AvailableDirective | false = available.find(a => a.roles.includes(this.role)) ?? false;
            if (work !== false) {
                this.creep.memory.directive = {
                    steps: work.steps,
                    stepIndex: 0,
                };
                if (--work.availableCount <= 0) {
                    const hash = serializeDirective(work);
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete this.room.room.memory.directives?.[hash];
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
            range: range,
            visualizePathStyle: {
                opacity: 0.1,
                lineStyle: "dashed",
                strokeWidth: 0.1,
                stroke: "#cccccc",
            },
        });
    }

    log(...args: Parameters<typeof console.log>) {
        console.log(`${this.room.name} -> ${this.name} | `, ...args);
    }
}
