'use strict';

import Builder from './builder';

function enabled(key) {
  const app = this.app || this;
  const appLocals = app.locals;
  const locals = Object.assign({}, applocals, this.locals);

  if (locals && locals[key]) {
    return true;
  }

  return false;
}

function extend(app, schema, optionalBuilder) {
  app.enabled = enabled;
  app.response.enabled = enabled;
  app.set('enabledFactory', optionalBuilder || new Builder());

  return (req, res, next) => {
    // step 2, build the feature flag list based on application and response locals
    res.locals.enabled = app.get('builder').build(schema, Object.assign({}, res.locals, app.locals));
    next();
  };
}

export default extend;
