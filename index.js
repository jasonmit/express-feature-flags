'use strict';

import get from 'lodash.get';

const predicateSymbol = Symbol();

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
        let predicate = this[predicateSymbol][rule.type];

        if (!predicate) {
          throw new Error(`Missing predicate ${rule.type}`);
        }

        const { key } = rule;
        const contextValue = get(context, rule.key);

        const result = predicate(contextValue, rule.value, {
          context,
          key
        });

        if ((rule.inverse && result) || !result) {
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
    this[predicateSymbol][type] = fn;
  }

  addPredicates(predicates) {
    this[predicateSymbol] = Object.assign(this[predicateSymbol] || {}, predicates);
  }
}

export default Builder;
