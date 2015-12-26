'use strict';

import get from 'lodash.get';

const PREDICATES = Symbol();

class Builder {
  constructor() {
    this.addPredicates({
      contains(needle, value) {
        if (typeof value === 'string') {
          return needle.includes(value);
        }

        return value.includes(needle);
      },

      eq(needle, value) {
        return needle === value;
      }
    });
  }

  build(definition, context) {
    return Object.keys(definition).reduce((out, key) => {
      const rules = [].concat(definition[key]);

      let enabled = true;

      for (let rule of rules) {
        let predicate = this[PREDICATES][rule.type];

        if (!predicate) {
          throw new Error(`Missing predicate ${rule.type}`);
        }

        const contextValue = get(context, rule.key);
        let ruleValue = rule.value;

        if (typeof ruleValue === 'function') {
          ruleValue = ruleValue(context);
        }

        let result = predicate(contextValue, ruleValue, {
          context: context,
          key: rule.key
        });

        if (rule.inverse) {
          result = !result;
        }

        if (!result) {
          enabled = false;
          break;
        }
      }

      if (enabled) {
        out[key] = true;
      }

      return out;
    }, {});
  }

  addPredicate(type, fn) {
    this[PREDICATES][type] = fn;
  }

  addPredicates(predicates) {
    this[PREDICATES] = Object.assign(this[PREDICATES] || {}, predicates);
  }
}

export default Builder;
