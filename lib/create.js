'use strict';

import Builder from './builder';

function initializer(app, builder, schema, ns) {
  return {
    get builder() {
      return builder;
    },

    init() {
      return function(req, res, next) {
        const context = Object.assign({}, app.locals, res.locals);
        res.locals[ns] = Object.freeze(builder.build(schema, context));
        next();
      }
    }
  }
}

function enabled(ns) {
  return function(key) {
    const app = this.app || this;
    const appLocals = app.locals;
    const locals = Object.assign({}, appLocals, this.locals);

    return !!(locals[ns] && locals[ns][key]);
  }
}

function initializerFactory(app, schema, options) {
  const opts = Object.assign({}, {
    namespace: 'enabledFeatures'
  }, options);

  if (!opts.builder) {
    opts.builder = new Builder();
  }

  const { namespace:ns } = opts;

  app.isEnabled = enabled(ns);
  app.response.isEnabled = enabled(ns);

  return initializer(app, opts.builder, schema, ns);
}

export default initializerFactory;
