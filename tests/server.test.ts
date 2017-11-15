import * as request from 'supertest';
import {} from 'jest';
import { expect, should } from 'chai';
import * as app from '../server/server';

/**
 * HOME CONTROLLER
 */
describe('GET /', () => {
  it('should return 200 OK', () => {
    return request(app)
      .get('/')
      .expect(200)
      .then(res => {
        expect(res.body).have.property('message');
        expect(res.body).have.property('version');
      });
  });
});

describe('GET /signup', () => {
  it('should return 200 OK', () => {
    return request(app)
      .get('/signup')
      .expect(200)
      .then(res => {
        expect(res.body).have.property('status');
      });
  });
});

describe('POST /signup', () => {
  // Cannot signup if off
  it('should not signup with SIGNUP_STATUS = off', () => {
    process.env.SIGNUP_STATUS = 'off';
    return request(app)
      .post('/signup')
      .expect(401)
      .then(res => {
        expect(res.body).have.property('message');
      });
  });
  
  // Can signup if off and admin token is wrong
  it('should not signup with SIGNUP_STATUS = off', () => {
    process.env.SIGNUP_STATUS = 'off';
    process.env.ADMIN_TOKEN = 'bla';
    return request(app)
      .post('/signup')
      .set('Authorization', 'wrong-token')
      .expect(401)
      .then(res => {
        expect(res.body).have.property('message');
      });
  });
  
  // Can signup if on and admin token is set
  it('should not signup with SIGNUP_STATUS = off', () => {
    process.env.SIGNUP_STATUS = 'off';
    process.env.ADMIN_TOKEN = 'bla';
    return request(app)
      .post('/signup')
      .set('Authorization', 'bla')
      .expect(200)
      .then(res => {
        expect(res.body).have.property('message');
      });
  });

  // Signup is restricted - no token
  
  // Signup is on
  it('should signup with SIGNUP_STATUS = on', () => {
    process.env.SIGNUP_STATUS = 'on';
    return request(app)
      .post('/signup')
      .expect(200)
      .then(res => {
        expect(res.body).have.property('message');
      });
  });
});

/**
 * USERS CONTROLLER
 */
describe('GET /users', () => {
  it('should return 200 OK', () => {
    return request(app)
      .get('/users')
      .expect(200)
      .then(res => {
        expect(res.body).have.property('message');
      });
  });
});
