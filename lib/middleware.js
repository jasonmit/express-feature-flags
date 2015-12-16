'use strict';

/**
* var enabled = require('feature-flag-builder/lib/middleware');
*
* app.use('/secret', enabled('feature-name', function(req, res, next) {
*   console.log('feature-name enabled!');
*   next();
* });
*/

function middleware(key, cb) {
  return function(req, res, next) {
    if (req.locals.enabled && req.locals.enabled[key]) {
      return cb.apply(this, req, res, next)
    }

    next();
  }
}

export default middleware;
