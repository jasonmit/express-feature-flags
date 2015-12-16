'use strict';

function middleware(key, cb) {
  return function(req, res, next) {
    if (req.locals.enabled && req.locals.enabled[key]) {
      return cb.apply(this, req, res, next)
    }

    next();
  }
}

export default middleware;
