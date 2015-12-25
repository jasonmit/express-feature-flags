# express-feature-flags

A tool for constructing complex feature-flags with Express

[![npm Version][npm-badge]][npm]

## Example

```js
// app/features-schema.js
const administrator = {
  type: 'contains',
  key: 'user.role',
  value: ['admin', 'root', 'sysadmin']
}

const features = {
  'administrator': administrator,
  'regular-user': Object.assign({ inverse: true }, administrator),
  'hidden-page': [{
    type: 'eq',
    key: 'user.authenticated',
    value: true
  }, {
    type: 'contains',
    key: 'locales',
    value({ user }) { return user.locale; }
  }, {
    type: 'gt',
    key: 'timestamp',
    value: 1449297410423
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
feature.builder.addPredicate('gt', (contextValue, value/*, meta*/) => {
  return contextValue > value;
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
app.use(feature.setup);

// conditional route example
app.use('/hidden', feature.middleware('hidden-page', (req, res, next) => {
  res.render('pages/hidden-page');
}));

app.use('/admin', feature.middleware('administrator', (req, res, next) => {
  res.render('pages/hidden-page');
}));

app.use('/', (req, res) => {
  if (res.isEnabled('administrator')) {
    return res.render('pages/home/power-user');
  }

  res.render('pages/home/regular-user');
});
```

## Using within a template

### Handlebars

```js
Handlebars.registerHelper('is-enabled', function(key, options) {
  return options.data.isEnabled(key);
});
```

### Exposing Feature Flag Hash
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
