'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var runtime = {exports: {}};

/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

(function (module) {
!(function(global) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  var generatorSymbol = "@@gen";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = module.exports ;

  // Keep a registry of all known generator functions so we can restore them in
  // the future. This is possible because we throw an error if generators are
  // declared anywhere other than the toplevel scope.
  var allGenerators = {};

  function wrap(innerFn, outerFn, argNames, argumentsVariable, self, argValues, tryLocsList) {
    if (!outerFn[generatorSymbol]) {
      throw new Error("Generator was not marked");
    }
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);

    var locals = {};
    if (argumentsVariable) {
      locals[argumentsVariable] = Array.prototype.slice.call(argValues, 0);
      Object.defineProperty(locals[argumentsVariable], 'callee', {
        value: outerFn,
        enumerable: false
      });
    }
    argNames.forEach(function(name, i) {
      locals[name] = argValues[i];
    });

    var context = new Context(outerFn, self === global ? null : self, locals, tryLocsList || []);
    generator._context = context;

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg1, arg2) {
    try {
      return { type: "normal", arg: fn.call(obj, arg1, arg2) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "s";
  var GenStateSuspendedYield = "y";
  var GenStateExecuting = "x";
  var GenStateCompleted = "c";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun, hash) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    genFun[generatorSymbol] = hash;
    allGenerators[hash] = genFun;
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn) {
    return function invoke(method, arg) {
      if (this._context.state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (this._context.state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = this._context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined$1)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            this._context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            this._context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined$1;

          var info = record.arg;
          if (info.done) {
            this._context[delegate.resultName] = info.value;
            this._context.next = delegate.nextLoc;
          } else {
            this._context.state = GenStateSuspendedYield;
            return info;
          }

          this._context.delegate = null;
        }

        if (method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          this._context.sent = this._context._sent = arg;

        } else if (method === "throw") {
          if (this._context.state === GenStateSuspendedStart) {
            this._context.state = GenStateCompleted;
            throw arg;
          }

          if (this._context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined$1;
          }

        } else if (method === "return") {
          this._context.abrupt("return", arg);
        }

        this._context.state = GenStateExecuting;

        var record = tryCatch(innerFn, this._context.self, this._context.locals, this._context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          this._context.state = this._context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: this._context.done
          };

          if (record.arg === ContinueSentinel) {
            if (this._context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined$1;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          this._context.state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(genFun, self, locals, tryLocsList) {
    this.genFun = genFun;
    this.self = self;
    this.locals = locals;
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);

    this.prev = 0;
    this.next = 0;
    // Resetting context._sent for legacy support of Babel's
    // function.sent implementation.
    this.sent = this._sent = undefined$1;
    this.done = false;
    this.delegate = null;
    this.state = GenStateSuspendedStart;

    this.tryEntries.forEach(resetTryEntry);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };

  runtime.serializeGenerator = function(gen) {
    if (Object.getPrototypeOf(Object.getPrototypeOf(gen)) !== Generator.prototype) {
      throw new Error("Cannot serialize subclass of Generator");
    }
    var ctx = gen._context;
    var result = Object.assign(Object.create(null), ctx);
    if (ctx.delegate) {
      result.delegate = {
        i: ctx.delegate.iterator,
        r: ctx.delegate.resultName,
        n: ctx.delegate.nextLoc,
      };
    }
    result.self = result.self;
    result.locals = result.locals;
    delete result.genHash;
    result[generatorSymbol] = ctx.genFun[generatorSymbol];
    return result;
  };

  runtime.deserializeGenerator = function(data) {
    var genFun = allGenerators[data[generatorSymbol]];
    if (!genFun) throw new Error("Invalid generator hash");

    var thisObject = null;
    var generator = genFun.call(thisObject);
    var ctx = (generator._context = Object.assign(
      Object.create(Context.prototype),
      data
    ));

    if (ctx.delegate) {
      ctx.delegate = {
        iterator: values(ctx.delegate.i),
        resultName: ctx.delegate.r,
        nextLoc: ctx.delegate.n,
      };
    }
    ctx.self = ctx.self;
    ctx.locals = ctx.locals;
    ctx.genFun = genFun;
    delete ctx[generatorSymbol];

    return generator;
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof commonjsGlobal === "object" ? commonjsGlobal :
  typeof window === "object" ? window :
  typeof self === "object" ? self : commonjsGlobal
);
}(runtime));

var cleanMemory = function cleanMemory() {
  var creepNames = Object.keys(Game.creeps);
  var toRemove = [];
  Object.keys(Memory.creeps).forEach(function (creepName) {
    if (!creepNames.includes(creepName)) {
      toRemove.push(creepName);
    }
  }); // eslint-disable-next-line @typescript-eslint/no-dynamic-delete

  toRemove.forEach(function (name) {
    return delete Memory.creeps[name];
  });
};

function cleanup() {
  if (Game.time % 50 === 0) {
    cleanMemory();
  }
}

var hashDirective = function hashDirective(d) {
  return "".concat(d.steps.map(function (s) {
    return "".concat(s.type, "-").concat(s.target);
  }));
};
var addDirectiveToRoom = function addDirectiveToRoom(r, d) {
  var hash = hashDirective(d);

  if (!Object.keys(r.memory.availableDirectives).includes(hash)) {
    r.memory.availableDirectives[hash] = d;
  }
};
var transformAvailableDirective = function transformAvailableDirective(d) {
  return {
    steps: d.steps,
    currentStepIndex: 0
  };
};

var _ref$1 = function () {
  var memo = {};
  var tick = Game.time;
  return {
    getDirectives: function getDirectives(r) {
      var _a;

      if (tick !== Game.time) {
        memo = {};
        tick = Game.time;
      }

      if (!memo[r.name]) {
        var allDirectives = Object.values((_a = r.memory.availableDirectives) !== null && _a !== void 0 ? _a : {});
        memo[r.name] = allDirectives.sort(function (a, b) {
          return b.priority - a.priority;
        });
      }

      return memo[r.name];
    },
    forceRememo: function forceRememo(r) {
      var _a;

      var allDirectives = Object.values((_a = r.memory.availableDirectives) !== null && _a !== void 0 ? _a : {});
      memo[r.name] = allDirectives.sort(function (a, b) {
        return b.priority - a.priority;
      });
    }
  };
}(),
    getDirectives = _ref$1.getDirectives,
    forceRememo = _ref$1.forceRememo;

var CreepPathStyle = {
  fill: "transparent",
  stroke: "#fff",
  lineStyle: "dashed",
  strokeWidth: 0.15,
  opacity: 0.1
};
var Priority;

(function (Priority) {
  Priority[Priority["EXTREME"] = 10] = "EXTREME";
  Priority[Priority["VERY_HIGH"] = 8] = "VERY_HIGH";
  Priority[Priority["HIGH"] = 6] = "HIGH";
  Priority[Priority["NORMAL"] = 5] = "NORMAL";
  Priority[Priority["LOW"] = 3] = "LOW";
  Priority[Priority["WHENEVER"] = 1] = "WHENEVER";
})(Priority || (Priority = {}));

var build = function build(creep, step) {
  var target = Game.getObjectById(step.target);

  if (target === null || !target.progressTotal) {
    console.log("Invalid Target!");
    return StepStatus.ERROR;
  }

  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
    creep.say("🔨✅");
    return StepStatus.COMPLETE;
  }

  var status = creep.build(target);

  switch (status) {
    case OK:
      return StepStatus.INCOMPLETE;

    case ERR_NOT_IN_RANGE:
      creep.moveTo(target, {
        visualizePathStyle: CreepPathStyle
      });
      return StepStatus.INCOMPLETE;

    case ERR_NOT_ENOUGH_ENERGY:
      return StepStatus.COMPLETE;

    case ERR_INVALID_TARGET:
      return StepStatus.ERROR;

    default:
      console.log("Unexpected status code ".concat(status, " found"));
      return StepStatus.ERROR;
  }
};

var collect = function collect(creep, step) {
  var target = Game.getObjectById(step.target); // @ts-expect-error Don't trust getObjectById

  if (target === null || !target.store) {
    console.log("Invalid Target!");
    return StepStatus.ERROR;
  }

  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    creep.say("🛻✅");
    return StepStatus.COMPLETE;
  }

  var status = creep.withdraw(target, RESOURCE_ENERGY);

  switch (status) {
    case OK:
      return StepStatus.INCOMPLETE;

    case ERR_NOT_IN_RANGE:
      creep.moveTo(target, {
        visualizePathStyle: CreepPathStyle
      });
      return StepStatus.INCOMPLETE;

    case ERR_NOT_ENOUGH_ENERGY:
      return StepStatus.COMPLETE;

    case ERR_INVALID_TARGET:
      return StepStatus.ERROR;

    default:
      console.log("Unexpected status code ".concat(status, " found"));
      return StepStatus.ERROR;
  }
};

var deposit = function deposit(creep, step) {
  var target = Game.getObjectById(step.target); // @ts-expect-error Don't trust getObjectById

  if (target === null || !target.store && target.structureType !== "controller") {
    console.log("Invalid Target!");
    return StepStatus.ERROR;
  }

  if (target.structureType !== "controller") {
    var store = target.store;

    if (store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      creep.say("💳✅");
      return StepStatus.COMPLETE;
    }
  }

  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
    creep.say("💳✅");
    return StepStatus.COMPLETE;
  }

  var status = creep.transfer(target, RESOURCE_ENERGY);

  switch (status) {
    case OK:
      return StepStatus.INCOMPLETE;

    case ERR_NOT_IN_RANGE:
      creep.moveTo(target, {
        visualizePathStyle: CreepPathStyle
      });
      return StepStatus.INCOMPLETE;

    case ERR_FULL:
    case ERR_NOT_ENOUGH_ENERGY:
      return StepStatus.COMPLETE;

    case ERR_INVALID_TARGET:
    case ERR_NO_PATH:
      return StepStatus.ERROR;

    default:
      console.log("Unexpected status code ".concat(status, " found"));
      return StepStatus.ERROR;
  }
};

var mine = function mine(creep, step) {
  var target = Game.getObjectById(step.target);

  if (target === null || typeof target.energy !== "number") {
    console.log("Invalid Target!"); // Abort this directive

    return StepStatus.ERROR;
  }

  if (creep.store.getFreeCapacity() === 0) {
    // Creep has filled up
    creep.say("⛏️✅");
    return StepStatus.COMPLETE;
  }

  var status = creep.harvest(target);

  switch (status) {
    case OK:
    case ERR_NOT_ENOUGH_ENERGY:
    case ERR_BUSY:
      return StepStatus.INCOMPLETE;

    case ERR_NOT_FOUND:
      return StepStatus.ERROR;

    case ERR_NOT_IN_RANGE:
      creep.moveTo(target, {
        visualizePathStyle: CreepPathStyle
      });
      return StepStatus.INCOMPLETE;

    default:
      console.log("Unexpected status code ".concat(status, " found"));
      return StepStatus.ERROR;
  }
};

var repair = function repair(creep, step) {
  var target = Game.getObjectById(step.target); // @ts-expect-error Don't trust getObjectById

  if (target === null || !target.store) {
    console.log("Invalid Target!");
    return StepStatus.ERROR;
  }

  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
    creep.say("🩹✅");
    return StepStatus.COMPLETE;
  }

  var status = creep.repair(target);

  switch (status) {
    case OK:
      return StepStatus.INCOMPLETE;

    case ERR_NOT_IN_RANGE:
      creep.moveTo(target, {
        visualizePathStyle: CreepPathStyle
      });
      return StepStatus.INCOMPLETE;

    case ERR_NOT_ENOUGH_ENERGY:
      return StepStatus.COMPLETE;

    case ERR_INVALID_TARGET:
      return StepStatus.ERROR;

    default:
      console.log("Unexpected status code ".concat(status, " found"));
      return StepStatus.ERROR;
  }
};

var steps = {
  mine: mine,
  deposit: deposit,
  build: build,
  repair: repair,
  collect: collect
};
var StepStatus;

(function (StepStatus) {
  StepStatus[StepStatus["COMPLETE"] = 1] = "COMPLETE";
  StepStatus[StepStatus["INCOMPLETE"] = 0] = "INCOMPLETE";
  StepStatus[StepStatus["ERROR"] = -1] = "ERROR";
})(StepStatus || (StepStatus = {}));

function creep_behaviors() {
  var _a;

  var _loop = function _loop() {
    var creep = _Object$values[_i];

    if (creep.memory.directive) {
      var directive = creep.memory.directive;
      var step = directive.steps[directive.currentStepIndex]; // @ts-expect-error Typescript is hard

      var status = steps[step.type](creep, step);

      switch (status) {
        case StepStatus.COMPLETE:
          creep.memory.directive.currentStepIndex += 1;

          if (creep.memory.directive.currentStepIndex >= creep.memory.directive.steps.length) {
            creep.memory.directive = undefined;
          }

          return "continue";

        case StepStatus.INCOMPLETE:
          return "continue";

        case StepStatus.ERROR:
          console.log("Unable to complete directive! ".concat(JSON.stringify(creep.memory.directive)));
          creep.memory.directive = undefined;
          return "continue";

        default:
          return "continue";
      }
    } else {
      var room = creep.room;
      var directives = getDirectives(room);

      if (directives.length) {
        var availableDirective = directives.find(function (d) {
          return d.roles.includes(creep.memory.role);
        });

        if (availableDirective) {
          var _directive = transformAvailableDirective(availableDirective);

          var directiveHash = hashDirective(availableDirective);

          if (((_a = room.memory.availableDirectives) === null || _a === void 0 ? void 0 : _a[directiveHash]) === undefined) {
            console.log("Couldn't find hash in memory; something is screwy");
            return "continue";
          }

          creep.memory.directive = _directive;
          room.memory.availableDirectives[directiveHash].available -= 1;

          if (room.memory.availableDirectives[directiveHash].available === 0) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete room.memory.availableDirectives[directiveHash];
            forceRememo(room);
          }

          return "continue";
        }
      }

      creep.say("No work");
      return "continue";
    }
  };

  for (var _i = 0, _Object$values = Object.values(Game.creeps); _i < _Object$values.length; _i++) {
    var _ret = _loop();

    if (_ret === "continue") continue;
  }
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var builder = {
  targetPopulation: 6,
  bodies: [[WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], [WORK, WORK, CARRY, CARRY, MOVE, MOVE], [WORK, CARRY, MOVE]]
};

var harvester = {
  targetPopulation: 6,
  bodies: [[WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], [WORK, WORK, CARRY, CARRY, MOVE, MOVE], [WORK, CARRY, MOVE]]
};

var roles = {
  harvester: harvester,
  builder: builder
};

function canSpawnBody(preferredSpawner, b) {
  var status = preferredSpawner.spawnCreep(b, "someScreepName", {
    dryRun: true
  });
  return status === OK;
}

var census = function census(room) {
  console.log("Executing Census for room ".concat(room.name));
  var preferredSpawner = room.find(FIND_MY_SPAWNS).reduce(function (p, c) {
    return (p === null || p === void 0 ? void 0 : p.store) && p.store.getUsedCapacity(RESOURCE_ENERGY) > c.store.getUsedCapacity(RESOURCE_ENERGY) ? p : c;
  }, undefined); // No spawner, no point;

  if (!preferredSpawner) return;
  var creeps = room.find(FIND_MY_CREEPS);
  var currentPopulation = creeps.reduce(function (out, creep) {
    out[creep.memory.role] += 1;
    return out;
  }, {
    "harvester": 0,
    "builder": 0
  });
  var totalMaxEnergy = room.energyCapacityAvailable; // Use find instead of forEach to let us bail out when we need to

  Object.entries(currentPopulation).find(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        roleName = _ref2[0],
        population = _ref2[1];

    // Get the role
    var role = roles[roleName]; // Check current population

    if (population >= role.targetPopulation) {
      // Population is correct, keep goin'
      return false;
    } // Pre-set memory


    var memory = {
      role: roleName
    }; // Identify target body

    var targetBody;

    if (role.bodies.length === 1 || population === 0) {
      /*
       * If there is only 1 type, or there are no screeps
       * Use the last (cheapest) body
       */
      targetBody = role.bodies[role.bodies.length - 1];
    } else {
      // Get current population ratio
      var ratio = population / role.targetPopulation;
      /**
       * Find which bodies are allowed for this population
       * Such that [a,b,c]
       * ratio > 1.2 ^ 1 (0.83) -> a is allowed
       * ratio > 1.2 ^ 2 (0.69) -> b is allowed
       * ratio > 1.2 ^ 3 (0.57) -> c is allowed
       * .
       * In theory, if a population is 85% full; only the first body will be allowed
       * If a population is ~70% full, the first and second (which is cheaper) will be allowed
       */

      var theoreticalTarget = role.bodies.find(function (_, i) {
        var aboveRatio = ratio >= 1 / Math.pow(1.2, i + 1) || i + 1 === role.bodies.length;

        if (aboveRatio) {
          // Ensure this room can actually afford this creep
          var cost = _.reduce(function (p, c) {
            return p + BODYPART_COST[c];
          }, 0);

          if (cost > totalMaxEnergy) {
            return false;
          }
        }

        return aboveRatio;
      });

      if (!theoreticalTarget || !canSpawnBody(preferredSpawner, theoreticalTarget)) {
        return false;
      }

      targetBody = theoreticalTarget;
    }

    var status = preferredSpawner.spawnCreep(targetBody, "".concat(roleName).concat(Game.time), {
      memory: memory
    });

    if (status !== OK) {
      console.log("Attempted and failed to spawn a ".concat(roleName, " with body ").concat(JSON.stringify(targetBody), ", recieved ").concat(status));
    }

    return status === OK;
  });
};

var CollectEnergyDirective = {
  roles: ["harvester"],
  steps: ["mine", "deposit"]
};
var createCollectEnergyDirective = function createCollectEnergyDirective(source, container, available) {
  return {
    roles: CollectEnergyDirective.roles,
    steps: [{
      type: "mine",
      target: source
    }, {
      type: "deposit",
      target: container
    }],
    available: available,
    priority: Priority.NORMAL
  };
};

var containerTypes = ["container", "storage", "extension"];

var _ref = function () {
  var targetCounts = {};
  var tick = Game.time;

  var populateMemo = function populateMemo(r) {
    var _a;

    var sourceRecord = r.find(FIND_SOURCES).reduce(function (p, c) {
      if (!p[c.id]) p[c.id] = 0;
      return p;
    }, {});
    var directives = (_a = r.memory.availableDirectives) !== null && _a !== void 0 ? _a : {};
    var result = Object.values(directives).reduce(function (p, c) {
      c.steps.forEach(function (s) {
        if (p[s.target]) {
          p[s.target] += 1;
        }
      });
      return p;
    }, sourceRecord);
    return result;
  };

  return {
    findBestSource: function findBestSource(r) {
      if (Game.time > tick + 10) {
        tick = Game.time;
        targetCounts = {};
      }

      if (targetCounts[r.name] === undefined) {
        targetCounts[r.name] = populateMemo(r);
      }

      var roomCounts = targetCounts[r.name];
      var mostAvailable = Math.min.apply(Math, _toConsumableArray(Object.values(targetCounts[r.name])));
      var id = Object.entries(roomCounts).find(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2),
            count = _ref3[1];

        return count === mostAvailable;
      });
      if (!id) throw new Error();
      targetCounts[r.name][id[0]] += 1;
      return id[0];
    }
  };
}(),
    findBestSource = _ref.findBestSource;

var directiveGeneration = function directiveGeneration(room) {
  if (!room.memory.availableDirectives) room.memory.availableDirectives = {}; // Attempt to fill spawn

  var spawns = room.find(FIND_MY_SPAWNS);
  spawns.forEach(function (s) {
    if (s.store.getFreeCapacity(RESOURCE_ENERGY)) {
      var directive = {
        roles: ["harvester"],
        steps: [{
          type: "mine",
          target: findBestSource(room)
        }, {
          type: "deposit",
          target: s.id
        }],
        available: 2,
        priority: s.store.getUsedCapacity(RESOURCE_ENERGY) < s.store.getCapacity(RESOURCE_ENERGY) / 2 ? Priority.HIGH : Priority.NORMAL
      };
      addDirectiveToRoom(room, directive);
    }
  }); // Attempt to fill containers

  var containers = room.find(FIND_STRUCTURES, {
    filter: function filter(s) {
      return containerTypes.includes(s.structureType);
    }
  });

  if (containers.length) {
    containers.forEach(function (c) {
      if (c.store.getFreeCapacity(RESOURCE_ENERGY)) {
        var directive = createCollectEnergyDirective(findBestSource(room), c.id, 2);
        addDirectiveToRoom(room, directive);
      }
    });
  } else {
    // If there are no containers, but there are container sites, create a different build job
    var containerSites = room.find(FIND_MY_CONSTRUCTION_SITES, {
      filter: function filter(f) {
        return containerTypes.includes(f.structureType);
      }
    });

    if (containerSites.length) {
      containerSites.forEach(function (cs) {
        addDirectiveToRoom(room, {
          roles: ["harvester", "builder"],
          steps: [{
            target: findBestSource(room),
            type: "mine"
          }, {
            target: cs.id,
            type: "build"
          }],
          available: 4,
          priority: Priority.HIGH
        });
      });
    }
  }

  var collectOrMine = containers.length ? {
    type: "collect",
    target: containers[0].id
  } : {
    type: "mine",
    target: findBestSource(room)
  }; // Attempt to build structures

  var sites = room.find(FIND_MY_CONSTRUCTION_SITES);
  var lowPrioritySites = ["road", "constructedWall", "rampart"];
  sites.forEach(function (s) {
    if (s.progress < s.progressTotal) {
      var directive = {
        roles: ["builder"],
        steps: [collectOrMine, {
          type: "build",
          target: s.id
        }],
        available: 2,
        priority: lowPrioritySites.includes(s.structureType) ? Priority.LOW : Priority.HIGH
      };
      addDirectiveToRoom(room, directive);
    }
  });
  var controller = room.controller;

  if (controller) {
    var controllerDirective = {
      roles: ["builder", "harvester"],
      steps: [collectOrMine, {
        type: "deposit",
        target: controller.id
      }],
      available: 4,
      priority: controller.ticksToDowngrade < CONTROLLER_DOWNGRADE[controller.level] / 2 ? Priority.HIGH : Priority.LOW
    };
    addDirectiveToRoom(room, controllerDirective);
  }
};

var planRoads = function planRoads(room) {
  var controller = room.controller;
  var sources = room.find(FIND_SOURCES);
  var nodes = [];

  if (controller) {
    nodes.push(controller.pos);
  }

  sources.forEach(function (s) {
    return nodes.push(s.pos);
  });
  var included_structures = ["container", "extension", "spawn"];
  var structures = room.find(FIND_MY_STRUCTURES, {
    filter: function filter(s) {
      return included_structures.includes(s.structureType);
    }
  });
  structures.forEach(function (s) {
    return nodes.push(s.pos);
  });
  var roadPositions = new Set();
  nodes.forEach(function (n1, i) {
    for (var j = i; j < nodes.length; j++) {
      var _PathFinder$search = PathFinder.search(n1, {
        pos: nodes[j],
        range: 1
      }),
          path = _PathFinder$search.path;

      path.forEach(function (p) {
        return roadPositions.add(p);
      });
    }
  });
  roadPositions.forEach(function (p) {
    return p.createConstructionSite(STRUCTURE_ROAD);
  });
};

var roomPlanning = function roomPlanning(r) {
  console.log("Executing Room Planning");
  planRoads(r);
};

function room_management() {
  for (var _i = 0, _Object$values = Object.values(Game.rooms); _i < _Object$values.length; _i++) {
    var room = _Object$values[_i];

    if (Game.time % 10 === 0) {
      census(room);
    }

    if (Game.time % 5 === 0) {
      directiveGeneration(room);
    }

    if (Game.time % 100 === 0) {
      roomPlanning(room);
    }
  }
}

var routines = {
  room_management: room_management,
  creep_behaviors: creep_behaviors,
  cleanup: cleanup
};

function loop() {
  routines.creep_behaviors();
  routines.room_management();
  routines.cleanup();
}

exports.loop = loop;
