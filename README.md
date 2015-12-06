# feature-flag-builder

A small utility for constructing complex feature-flags based on rules.

## Example

```js
import Builder from 'feature-flag-builder';

const builder = new Builder();

// add a custom predicate, ships with eq and contains
builder.addPredicate('gt', (contextValue, value/*, meta*/) => {
  return contextValue > value;
});

const administratorRule = {
  type: 'contains',
  key: 'user.role',
  value: ['admin', 'root', 'sysadmin']
}

const features = {
  'administrator': administratorRule,
  'regular-user': Object.assign({ inverse: true }, administratorRule),
  'is-owner': {
    type: 'eq',
    key: 'user.name',
    value: 'jasonmit'
  },
  'display-hidden-feature': [{
    type: 'eq',
    key: 'user.authenticated',
    value: true
  }, {
    type: 'gt',
    key: 'timestamp',
    value: 1449297410423
  }],
  'dinosaurs-two': {
    type: 'contains',
    key: 'movies',
    value: 'The Good Dinosaur 2'
  }
};

// this would typically be built up as a combination
// of application and user-specific context.
// In terms of an Express application, this would likely 
// be `Object.assign({}, app.locals, req.locals);`
const context = {
  timestamp: new Date().getTime(),
  user: {
    authenticated: true,
    name: 'jasonmit',
    ip: '192.168.2.100',
    role: 'admin'
  },
  movies: [
    'The Hunger Games: Mockingjay - Part 2',
    'The Good Dinosaur',
    'The Good Dinosaur 2'
  ]
};

builder.build(features, context); // =>
// {
//   administrator: true,
//   'is-owner': true,
//   'display-hidden-feature': true,
//   'dinosaurs-two': true
// }
