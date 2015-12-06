'use strict';

import get from 'lodash.get';

const BUILT_IN_PREDICATES = {
  contains(needle, value) {
    if (typeof value === 'string') {
      return needle.includes(value);
    }

    return value.includes(needle);
  },

  eq(needle, value) {
    return needle === value;
  }
}

class Builder {
  constructor() {
    this.addPredicates(BUILT_IN_PREDICATES);
  }

  build(definition, context) {
    return Object.keys(definition).reduce((out, key) => {
      const rules = [].concat(definition[key]);

      let enabled = true;

      for (let rule of rules) {
        let predicate = this.predicates[rule.type];

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
    this.predicates[type] = fn;
  }

  addPredicates(predicates) {
    this.predicates = Object.assign(this.predicates || {}, predicates);
  }
}

export default Builder;
