"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const r={},f=()=>{if(Game.time%100===0)for(const o in Memory.creeps)o in Game.creeps||delete Memory.creeps[o];for(const o in Game.creeps){const e=Game.creeps[o];if(!e.my)continue;const s=e.memory.room||e.room.name;r[s]=r[s]||[],r[s].push(e)}},y=o=>{var t,a;typeof o=="string"&&(o=Game.rooms[o]);const e=(t=r[o.name])!=null?t:[];let s=[],n="";if(e.length<3&&o.energyAvailable>=250&&(s=["work","carry","move","move"],n="basic-worker"),s.length){const l=o.find(FIND_MY_SPAWNS,{filter:m=>!m.spawning});if(l.length){const m=(a=l.pop())==null?void 0:a.spawnCreep(s,[o.name,Game.time,n].filter(Boolean).join(":"),{memory:{room:o.name,role:n}});m===OK?console.log("Spawned a screep!"):console.log("Failed to spawn a screep!",m)}}},k={fill:"transparent",opacity:.1,stroke:"#febf2b",strokeWidth:.2,lineStyle:"dashed"},c={reusePath:20,visualizePathStyle:k},i=(o,e)=>{if(console.log(`${o.name} finished their task`),o.memory.task){const s=o.room.memory.tasks[o.memory.task].indexOf(o.name);o.room.memory.tasks[o.memory.task][s]=null}o.memory.task=e},d=o=>{const e=Object.entries(o.room.memory.tasks).find(([n,t])=>t.indexOf(null)>=0);if(!e){console.log(`${o.name} is bored`);return}const s=e[1].indexOf(null);e[1][s]=o.name,o.memory.task=e[0]},u=(o,e)=>{switch(o.transfer(e,RESOURCE_ENERGY)){case ERR_NOT_IN_RANGE:o.moveTo(e,c);break;case OK:o.store.getUsedCapacity()===0&&i(o);break}},S=(o,e)=>{switch(o.harvest(e)){case ERR_NOT_IN_RANGE:o.moveTo(e,c);break;case OK:if(o.store.getFreeCapacity()===0){if(!o.room.controller)throw new Error("Creep is full in a room without a controller");const n=o.room.find(FIND_MY_SPAWNS,{filter:t=>t.store.getFreeCapacity(RESOURCE_ENERGY)>0});n.length?i(o,n[0].id):i(o,o.room.controller.id)}break}},g=()=>{var o;f();for(const e in Game.rooms){const s=Game.rooms[e];s.memory.tasks||(s.memory.tasks={}),y(s);const n=(o=r[e])!=null?o:[];for(const t of n)if(t.memory.task||d(t),t.memory.task){const a=Game.getObjectById(t.memory.task);a instanceof Source?S(t,a):(a instanceof StructureStorage||a instanceof StructureController)&&u(t,a)}for(const t of s.find(FIND_SOURCES_ACTIVE))s.memory.tasks[t.id]||(s.memory.tasks[t.id]=[null,null,null])}};exports.loop=g;
//# sourceMappingURL=my-lib.js.map
