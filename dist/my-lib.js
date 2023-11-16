"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});Creep.prototype.speak=function(...o){console.log(this.name,...o)};const m={},c=()=>{if(Game.time%100===0)for(const o in Memory.creeps)o in Game.creeps||delete Memory.creeps[o];for(const o in Game.creeps){const s=Game.creeps[o];if(!s.my)continue;const e=s.memory.room||s.room.name;m[e]=m[e]||[],m[e].push(s)}},k=o=>{var t,a;typeof o=="string"&&(o=Game.rooms[o]);const s=(t=m[o.name])!=null?t:[];let e=[],n="";if(s.length<3&&o.energyAvailable>=250&&(e=["work","carry","move","move"],n="basic-worker"),e.length){const l=o.find(FIND_MY_SPAWNS,{filter:r=>!r.spawning});if(l.length){const r=(a=l.pop())==null?void 0:a.spawnCreep(e,[o.name,Game.time,n].filter(Boolean).join(":"),{memory:{room:o.name,role:n}});r===OK?console.log("Spawned a screep!"):console.log("Failed to spawn a screep!",r)}}},y={fill:"transparent",opacity:.1,stroke:"#febf2b",strokeWidth:.2,lineStyle:"dashed"},f={reusePath:20,visualizePathStyle:y},i=(o,s)=>{var e;if(o.speak("Work Complete"),o.memory.task){console.log(o.room.memory.tasks[o.memory.task],o.room.memory.tasks,o.memory.task);const n=(e=o.room.memory.tasks[o.memory.task])==null?void 0:e.indexOf(o.name);o.room.memory.tasks[o.memory.task][n]=null}o.memory.task=s},d=o=>{const s=Object.entries(o.room.memory.tasks).find(([n,t])=>t.indexOf(null)>=0);if(!s){o.speak("Bored");return}const e=s[1].indexOf(null);s[1][e]=o.name,o.memory.task=s[0]},u=(o,s)=>{const e=o.transfer(s,RESOURCE_ENERGY);switch(e){case ERR_NOT_IN_RANGE:o.moveTo(s,f);break;case OK:case ERR_NOT_ENOUGH_ENERGY:o.speak(`Depositing (${o.store.getUsedCapacity()} / ${o.store.getCapacity()})`),o.store.getUsedCapacity()===0&&i(o);break;default:o.speak("Unhandled deposit status",e)}},p=(o,s)=>{switch(o.harvest(s)){case ERR_NOT_IN_RANGE:o.moveTo(s,f);break;case OK:if(o.store.getFreeCapacity()===0){if(!o.room.controller)throw new Error("Creep is full in a room without a controller");const n=o.room.find(FIND_MY_SPAWNS,{filter:t=>t.store.getFreeCapacity(RESOURCE_ENERGY)>0});n.length?i(o,n[0].id):i(o,o.room.controller.id)}break}},g=()=>{var o;c();for(const s in Game.rooms){const e=Game.rooms[s];e.memory.tasks||(e.memory.tasks={}),k(e);const n=(o=m[s])!=null?o:[];for(const t of n)if(t.memory.task||d(t),t.memory.task){const a=Game.getObjectById(t.memory.task);a instanceof Source?(t.speak("Mining"),p(t,a)):a instanceof StructureStorage||a instanceof StructureController?(t.speak("Depositing"),u(t,a)):t.speak("Broken",a)}for(const t of e.find(FIND_SOURCES_ACTIVE))e.memory.tasks[t.id]||(e.memory.tasks[t.id]=[null,null,null])}};exports.loop=g;
//# sourceMappingURL=my-lib.js.map
