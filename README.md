# express-feature-flags

A tool for constructing complex feature-flags with Express

## Example

```js
// app/features-schema.js
const administratorRule = {
  type: 'contains',
  key: 'user.role',
  value: ['admin', 'root', 'sysadmin']
}

const features = {
  'administrator': administratorRule,
  'regular-user': Object.assign({ inverse: true }, administratorRule),
  'hidden-page': [{
    type: 'eq',
    key: 'user.authenticated',
    value: true
  }, {
    type: 'contains',
    key: 'supportedLocales',
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
// app/index.js
import express from 'express';
import { Builder, middleware:enabled } from 'express-feature-flags';
import schema from './features-schema';

const app = express();
const builder = new Builder();

// add a custom predicate, ships with eq and contains
builder.addPredicate('gt', (contextValue, value/*, meta*/) => {
  return contextValue > value;
});

app.set('builder', builder);
app.locals.supportedLocales = ['en-US', 'en-CA'];

app.use((req, res, next) => {
  // step 1, build the request context
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

app.use((req, res, next) => {
  // step 2, build the feature flag list based on application and response local variable
  res.locals.enabled = app.get('builder').build(schema, Object.assign({}, res.locals, app.locals));
  next();
});

app.use('/hidden', enabled('hidden-page', (req, res, next) => {
  res.render('pages/hidden-page');
}));

app.use('/admin', enabled('administrator', (req, res, next) => {
  res.render('pages/hidden-page');
}));

app.use('/', (req, res) => {
  if (res.locals.enabled['administrator']) {
    return res.render('pages/home/power-user');
  }

  res.render('pages/home/regular-user');
});
```

## TODO

```hbs
{{#enabled 'ab-test'}}
  <button class="green btn">Submit</button>
{{else}}
  <button class="red btn">Submit</button>
{{/enabled}}
```
