const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index.js');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('App', () => {
  describe('Invalid endpoint', () => {
    test('Status: 404 // Returns "Not found"', () => {
      return request(app)
        .get('/InvalidEndpoint')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('Not found');
        });
    });
  });
});

describe('1. GET /api/topics', () => {
  test('Status: 200 // Returns an array of topic objects containing a slug and description', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).toBeInstanceOf(Array);
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});

describe('2. GET /api/articles/:article_id', () => {
  test('Status: 404 // Returns "not found" for valid non-existent IDs', () => {
    return request(app)
      .get('/api/articles/1233')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Article not found');
      });
  });
  test('Status: 400 // Returns "Bad Request" for invalid IDs', () => {
    return request(app)
      .get('/api/articles/AnInvalidID')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
  test('Status: 200 // Returns an object with correct article_id', () => {
    return request(app)
      .get('/api/articles/2')
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toBeInstanceOf(Object);
        expect(article[0].article_id).toBe(2);
      });
  });
  test('Status: 200 // Returned object contains properties for author, title, article_id, body, topic, created_at, and votes', () => {
    return request(app)
      .get('/api/articles/2')
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article[0]).toEqual(
          expect.objectContaining({
            author: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            article_id: expect.any(Number),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
          })
        );
      });
  });
});