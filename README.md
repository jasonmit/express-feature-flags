# express-feature-flags

A tool for constructing complex feature-flags with Express

[![npm Version][npm-badge]][npm]

## Example

```js
// app/features-schema.js
const administrator = {
  type: 'contains',
  key: 'user.role',
  comparison: ['admin', 'root', 'sysadmin']
}

const features = {
  'administrator': administrator,
  'regular-user': Object.assign({ inverse: true }, administrator),
  'hidden-page': [{
    type: 'eq',
    key: 'user.authenticated',
    comparison: true
  }, {
    type: 'contains',
    key: 'locales',
    comparison({ user }) { return user.locale; }
  }, {
    type: 'gt',
    key: 'timestamp',
    comparison: 1449297410423
  }]
};

export default features;
```

```js
// app/server.js
import express from 'express';
import featureFlags from 'express-feature-flags';
import featureSchema from './features-schema';

const app = express();
const feature = featureFlags.create(app, featureSchema);

// optional: add a custom predicate
// supported of the box: eq, neq, contains, gt, gte, lt, lte
feature.builder.registerPredicate('blank', (value/*, rule */) => {
  if (typeof value === 'undefined') {
    return true;
  }

  return value.length && value.length === 0;
});

app.locals.locales = ['en-US', 'en-CA'];

app.use((req, res, next) => {
  Object.assign(res.locals, {
    timestamp: new Date().getTime(),
    user: {
      authenticated: req.user.isAuthenticated,
      role: req.user.role,
      locale: req.locale.code
    }
  });

  next();
});

/**
 * Responsible for constructing the enabled feature list on per-request basis.
 * Ordering the middleware after your request context is finish being
 * built BUT BEFORE any logic that checks if a feature is enabled
 * is very important!
 */
app.use(feature.init());

// conditional route example
function enabled(key, cb) {
  return function(req, res, next) {
    if (res.isEnabled(key)) {
      return cb(...arguments);
    }

    next();
  }
}

app.use('/hidden', enabled('hidden-page', (req, res, next) => {
  res.render('pages/hidden-page');
}));

app.use('/admin', enabled('administrator', (req, res, next) => {
  res.render('pages/hidden-page');
}));

app.use('/', (req, res) => {
  if (res.isEnabled('administrator')) {
    return res.render('pages/home/power-user');
  }

  res.render('pages/home/regular-user');
});
```

## Templating Engine Integration

### Handlebars

#### Template Helper

```js
Handlebars.registerHelper('is-enabled', function(key, options) {
  return options.data.isEnabled(key);
});
```

#### Exposing Feature Flags

```js
Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});
```

```js
window.FEATURES = {{{json @root.enabled}}}
```

[npm]: https://www.npmjs.org/package/express-feature-flags
[npm-badge]: https://img.shields.io/npm/v/express-feature-flags.svg?style=flat-square
