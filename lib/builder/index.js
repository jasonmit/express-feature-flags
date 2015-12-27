'use strict';

import get from 'lodash.get';

import predicates from './predicates';

const PREDICATES = Symbol();

class Builder {
  constructor() {
    this.registerPredicates(predicates);
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

        let result = predicate(get(context, rule.key), Object.assign({}, rule, {
          context
        }));

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

  registerPredicate(type, fn) {
    this[PREDICATES][type] = fn;
  }

  registerPredicates(predicates) {
    this[PREDICATES] = Object.assign(this[PREDICATES] || {}, predicates);
  }
}

export default Builder;
