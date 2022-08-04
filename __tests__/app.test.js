const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index.js');
require('jest-sorted');

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

describe('1. GET - /api/topics', () => {
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

describe('2. GET - /api/articles/:article_id', () => {
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
            comment_count: expect.any(Number),
          })
        );
      });
  });
});

describe('3. PATCH - /api/articles/:article_id', () => {
  test('Status: 400 // Returns "Bad request" when votes are not provided', () => {
    return request(app)
      .patch('/api/articles/4')
      .expect(400)
      .then(({ body }) => expect(body.msg).toBe('No votes submitted'));
  });
  test('Status 400 // Returns "Bad request" on inavlid ID', () => {
    return request(app)
      .patch('/api/articles/banana')
      .send({ inc_votes: 3 })
      .expect(400)
      .then(({ body }) => expect(body.msg).toBe('Bad request'));
  });
  test('Status: 404 // Returns "Not found" on valid non-existent article ID', () => {
    return request(app)
      .patch('/api/articles/5000')
      .send({ inc_votes: 3 })
      .expect(404)
      .then(({ body }) => expect(body.msg).toBe('Article not found'));
  });
  test('Status: 400 // Returns bad request for invalid syntax', () => {
    return request(app)
      .patch('/api/articles/5')
      .send({ inc_votes: 'three' })
      .expect(400)
      .then(({ body }) => expect(body.msg).toBe('Bad request'));
  });
  test('Status: 200 // Increments votes on valid article IDs', () => {
    return request(app)
      .patch('/api/articles/5')
      .send({ inc_votes: 3 })
      .expect(200)
      .then(({ body }) => {
        const article = body;
        expect(article[0].article_id).toBe(5);
        expect(article[0].votes).toBe(3);
      });
  });
  test('Status: 200 // Decrements votes on valid article IDs', () => {
    return request(app)
      .patch('/api/articles/6')
      .send({ inc_votes: -3 })
      .expect(200)
      .then(({ body }) => {
        const article = body;
        expect(article[0].article_id).toBe(6);
        expect(article[0].votes).toBe(-3);
      });
  });
});

describe('4. GET - /api/users', () => {
  test('Status: 200 // Returns an array of user objects containing a name, username, and avatar_url', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toBeInstanceOf(Array);
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
});

describe('5. GET - /api/articles', () => {
  test('Status: 200 // Returns array of article objects', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        const articles = body;
        expect(articles).toBeInstanceOf(Array);
      });
  });
  test('Status: 200 // Article objects contain props for author, title, topic, article_id, created_at, votes, and comment_count', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        const articles = body;
        expect(articles.length).toBeGreaterThan(0);
        articles.forEach((article) =>
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            article_id: expect.any(Number),
            created_at: expect.any(String),
            votes: expect.any(Number),
            comment_count: expect.any(Number),
          })
        );
      });
  });
  test('Status: 200 // Objects are sorted by created_at descending', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        const articles = body;
        expect(articles).toBeSortedBy('created_at', { descending: true });
      });
  });
});

describe('6. GET - /api/articles/:article_id/comments', () => {
  test('Status: 404 // Returns "Not found" for valid non-existent article_ID', () => {
    return request(app)
      .get('/api/articles/5000/comments')
      .expect(404)
      .then(({ body }) => expect(body.msg).toBe('Article not found'));
  });
  test('Status: 400 // Returns "Bad request" for invalid article_id', () => {
    return request(app)
      .get('/api/articles/coconuts/comments')
      .expect(400)
      .then(({ body }) => expect(body.msg).toBe('Bad request'));
  });
  test('Status: 200 // Returns an array of objects', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        const comments = body;
        expect(comments).toBeInstanceOf(Array);
      });
  });
  test('Status: 200 // Returns an empty array for articles without comments', () => {
    return request(app)
      .get('/api/articles/2/comments')
      .expect(200)
      .then(({ body }) => {
        const comments = body;
        expect(comments).toBeInstanceOf(Array);
        expect(comments.length).toBe(0);
      });
  });
  test('Status: 200 // Comment objects include props for comment_id, votes, created_at, author, and body', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        const comments = body;
        expect(comments.length).toBeGreaterThan(0);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
          });
        });
      });
  });
});
