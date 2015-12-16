'use strict';

import { Builder } from '../';

const builder = new Builder();

// add a custom operation, ships with eq and contains
builder.addPredicate('gt', (contextValue, value/*, meta*/) => {
  return contextValue > value;
});

const administratorRule = {
  type: 'contains',
  key: 'user.role',
  value: ['admin', 'root', 'sysadmin']
}

const definition = {
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

const context = {
  timestamp: new Number(new Date()),
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

console.log(builder.build(definition, context)); // =>
// {
//   administrator: true,
//   'is-owner': true,
//   'display-hidden-feature': true,
//   'dinosaurs-two': true
// }
