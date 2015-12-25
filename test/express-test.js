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
      value: 'jasonmit'
    },
    bar: {
      type: 'eq',
      key: 'user.name',
      value: 'shawndumas'
    }
  });

  app.use((req, res, next) => {
    res.locals.user = {
      name: 'jasonmit'
    }

    next();
  });

  app.use(feature.setup);

  app.use('/foo', feature.middleware('foo', (req, res, next) => {
    res.send();
  }));

  app.use('/bar', feature.middleware('bar', (req, res, next) => {
    res.send();
  }));

  it('should return a setup function', () => {
    expect(feature.setup).to.exist;
  });

  it('should return a middleware function', () => {
    expect(feature.middleware).to.exist;
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
      expect(res.locals.enabled).to.be.a('object');
      expect(res.locals.enabled.foo).to.be.a('boolean');
      expect(res.locals.enabled.bar).to.be.a('undefined');
      expect(res.locals.enabled).to.deep.equal({ foo: true });
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
