import { meta as metaFor } from './meta';
import require, { has } from 'require';
import run from './run_loop';

const { backburner } = run;
let hasGlimmer = has('glimmer-reference');
let CONSTANT_TAG, CURRENT_TAG, DirtyableTag, makeTag;

export let markObjectAsDirty;

export function tagFor(object, _meta) {
  if (!hasGlimmer) {
    throw new Error('Cannot call tagFor without Glimmer');
  }

  if (object && typeof object === 'object') {
    let meta = _meta || metaFor(object);
    return meta.writableTag(makeTag);
  } else {
    return CONSTANT_TAG;
  }
}

class SchedulerRegistrar {
  constructor() {
    let schedulerRegistrar = this;
    this._eventCallbacks = {
      begin: []
    };

    this._trigger = backburner._trigger;
    this.register = backburner.on;
    this.deregister = backburner.off;

    function bindEventName(eventName) {
      return function trigger(arg1, arg2) {
        schedulerRegistrar._trigger(eventName, arg1, arg2);
      };
    }

    for (let eventName in this._eventCallbacks) {
      if (backburner._eventCallbacks.hasOwnProperty(eventName)) {
        backburner.on(eventName, bindEventName(eventName));
      }
    }
  }

  hasRegistrations() {
    return !!this._eventCallbacks.length;
  }
}
export const schedulerRegistrar = new SchedulerRegistrar();

function K() {}
function ensureRunloop() {
  if (schedulerRegistrar.hasRegistrations() && !run.backburner.currentInstance) {
    run.schedule('actions', K);
  }
}

if (hasGlimmer) {
  ({ DirtyableTag, CONSTANT_TAG, CURRENT_TAG } = require('glimmer-reference'));
  makeTag = function() { return new DirtyableTag(); };

  markObjectAsDirty = function(meta) {
    ensureRunloop();
    let tag = (meta && meta.readableTag()) || CURRENT_TAG;
    tag.dirty();
  };
} else {
  markObjectAsDirty = function() {};
}
