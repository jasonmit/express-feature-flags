'use strict';

import Builder from './builder';

function enabled(ns) {
  return function(key) {
    const app = this.app || this;
    const appLocals = app.locals;
    const locals = Object.assign({}, appLocals, this.locals);

    return locals[ns] && locals[ns][key];
  }
}

function create(app, schema, options) {
  const opts = Object.assign({}, {
    namespace: 'enabled'
  }, options);

  if (!opts.builder) {
    opts.builder = new Builder();
  }

  const { namespace:ns, builder } = opts;

  app.isEnabled = enabled(ns);
  app.response.isEnabled = enabled(ns);

  return {
    builder,

    setup(req, res, next) {
      const context = Object.assign({}, app.locals, res.locals);
      res.locals[ns] = Object.freeze(builder.build(schema, context));
      next();
    },

    middleware(key, cb) {
      return function(req, res, next) {
        if (res.locals[ns] && res.locals[ns][key]) {
          return cb(...arguments);
        }

        next();
      }
    }
  }
}

export default create;
