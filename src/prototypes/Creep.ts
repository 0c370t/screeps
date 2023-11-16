import { DEFAULT_MOVE_OPTS } from "../constants"

Creep.prototype.speak = function(this: Creep, ...args: Parameters<typeof console.log>) {
    console.log(this.name, ...args)
}

// @ts-expect-error overloads are dumb
Creep.prototype.goto = function(this: Creep, target: Parameters<Creep["moveTo"]>[0] | number, opts?: MoveToOpts | number): ReturnType<Creep["moveTo"]> {
    if (typeof target === "number" || typeof opts === "number") return ERR_INVALID_TARGET;
    const r = this.moveTo(target, Object.assign({}, DEFAULT_MOVE_OPTS, opts))

    // They might be blocked on their "remembered" path; we should tone that way down to try and get them unstuck
    if (r !== OK) return this.moveTo(target, Object.assign({}, DEFAULT_MOVE_OPTS, opts, { reusePath: 2 }))
    return r
}