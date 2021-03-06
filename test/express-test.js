'use strict';

import mocha from 'mocha';
import express from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { create } from '../';

const app = express();

describe('Create', () => {
  it('should exist', () => {
    expect(create).to.exist;
  });
});

describe('Express Integration', () => {
  const app = express();

  const feature = create(app, {
    foo: {
      type: 'eq',
      key: 'user.name',
      comparison: 'jasonmit'
    },
    bar: {
      type: 'eq',
      key: 'user.name',
      comparison: 'shawndumas'
    }
  });

  app.use((req, res, next) => {
    res.locals.user = {
      name: 'jasonmit'
    }

    next();
  });

  app.use(feature.register());

  function is(key, middlewareFunc) {
    return function(req, res, next) {
      if (res.isEnabled(key)) {
        return middlewareFunc.call(this, req, res, next);
      }

      next();
    }
  }

  app.use('/foo', is('foo', (req, res, next) => {
    res.send();
  }));

  app.use('/bar', is('bar', (req, res, next) => {
    res.send();
  }));

  it('should return a register function', () => {
    expect(feature.register).to.exist;
    expect(feature.register).to.be.a('function');
  });

  it('should return a builder instance', () => {
    expect(feature.builder).to.exist;
    expect(feature.builder).to.be.a('object');
  });

  it('foo should be accessible', (done) => {
    request(app)
      .get('/foo')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        done();
      });
  });

  it('bar should not be accessible', (done) => {
    request(app)
      .get('/bar')
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        done();
      });
  });

  it('should write to res.locals.enabled by default', (done) => {
    app.use((req, res, next) => {
      expect(res.isEnabled).to.be.a('function');
      expect(res.locals.enabledFeatures).to.be.a('object');
      expect(res.locals.enabledFeatures.foo).to.be.a('boolean');
      expect(res.locals.enabledFeatures.bar).to.be.a('undefined');
      expect(res.locals.enabledFeatures).to.deep.equal({ foo: true });
      expect(res.isEnabled('foo')).to.equal(true);
      expect(res.isEnabled('bar')).to.equal(false);
      next();
    });

    request(app)
      .get('/')
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        done();
      });
  });
});
