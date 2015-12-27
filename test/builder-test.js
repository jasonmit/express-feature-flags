'use strict';

import mocha from 'mocha';
import { expect } from 'chai';
import { Builder } from '../';

describe('Builder', function() {
  it('should exist', function() {
    expect(Builder).to.exist;
  });

  it('should have a registerPredicate function', function() {
    const builder = new Builder();

    expect(builder.registerPredicate).to.be.a('function');
  });
});

describe('Builder Functionality', function() {
  const builder = new Builder();

  const administratorRule = {
    type: 'contains',
    key: 'user.role',
    expect: ['admin', 'root', 'sysadmin']
  }

  const definition = {
    'administrator': administratorRule,
    'regular-user': Object.assign({ inverse: true }, administratorRule),
    'is-owner': {
      type: 'eq',
      key: 'user.name',
      expect: 'jasonmit'
    },
    'display-hidden-feature': [{
      type: 'eq',
      key: 'user.authenticated',
      expect: true
    }, {
      type: 'gt',
      key: 'timestamp',
      expect: 1449297410423
    }],
    'dinosaurs': {
      type: 'contains',
      key: 'movies',
      expect: 'The Good Dinosaur'
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
      'Harry Potter',
      'The Good Dinosaur',
    ]
  };

  it('should return expected output', function() {
    const expected = {
      administrator: true,
      'is-owner': true,
      'display-hidden-feature': true,
      dinosaurs: true
    }

    expect(builder.build(definition, context)).to.deep.equal(expected);
  });
});
