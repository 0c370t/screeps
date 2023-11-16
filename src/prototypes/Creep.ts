Creep.prototype.speak = function(this: Creep, ...args: Parameters<typeof console.log>) {
    console.log(this.name, ...args)
}