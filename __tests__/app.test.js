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
        const { article } = body;
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
        const { article } = body;
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
        const { articles } = body;
        expect(articles).toBeInstanceOf(Array);
      });
  });
  test('Status: 200 // Article objects contain props for author, title, topic, article_id, created_at, votes, and comment_count', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
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
        const { articles } = body;
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
        const { comments } = body;
        expect(comments).toBeInstanceOf(Array);
      });
  });
  test('Status: 200 // Returns an empty array for articles without comments', () => {
    return request(app)
      .get('/api/articles/2/comments')
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeInstanceOf(Array);
        expect(comments.length).toBe(0);
      });
  });
  test('Status: 200 // Comment objects include props for comment_id, votes, created_at, author, and body', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBeGreaterThan(0);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            article_id: expect.any(Number),
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

describe('7. POST /api/articles/:article_id/comments', () => {
  describe('Status: 400 // Bad requests:', () => {
    test('Invalid article IDs', () => {
      return request(app)
        .post('/api/articles/coconuts/comments')
        .send({ username: 'harrypotter', body: "I'm a wizard!" })
        .expect(400)
        .then(({ body }) => expect(body.msg).toBe('Bad request'));
    });
    test('Empty username', () => {
      return request(app)
        .post('/api/articles/1/comments')
        .send({ body: "I'm a wizard!" })
        .expect(400)
        .then(({ body }) => expect(body.msg).toBe('Username is required'));
    });
    test('Empty body', () => {
      return request(app)
        .post('/api/articles/1/comments')
        .send({ username: 'harrypotter' })
        .expect(400)
        .then(({ body }) => expect(body.msg).toBe('Body is required'));
    });
    test('Empty input', () => {
      return request(app)
        .post('/api/articles/1/comments')
        .send({})
        .expect(400)
        .then(({ body }) =>
          expect(body.msg).toBe('Username and body are required')
        );
    });
    test('Invalid username syntax', () => {
      return request(app)
        .post('/api/articles/1/comments')
        .send({
          username: 8675309,
          body: "Hey, Jenny, don't change your number",
        })
        .expect(400)
        .then(({ body }) => expect(body.msg).toBe('Username must be a string'));
    });
  });
  describe('Status: 404 // Not found:', () => {
    test('Valid but non-existent article_id', () => {
      return request(app)
        .post('/api/articles/5000/comments')
        .send({
          username: 'JamesHetfield',
          body: 'Nomad, vagabond, call me what you will',
        })
        .expect(404)
        .then(({ body }) => expect(body.msg).toBe('Article not found'));
    });
  });
  describe('Status: 201 // Created:', () => {
    test('Responds with the posted comment', () => {
      return request(app)
        .post('/api/articles/2/comments')
        .send({
          username: 'lurker',
          body: 'Im just lurking',
        })
        .expect(201)
        .then(({ body }) => {
          const { comment } = body;
          const expected = 'Im just lurking';
          expect(comment.body).toEqual(expected);
        });
    });
  });
});

describe('8. GET - /api/articles?queries)', () => {
  describe('Status: 400 // Bad requests:', () => {
    test('Invalid sort query', () => {
      return request(app)
        .get('/api/articles?sort_by=asdkf')
        .expect(400)
        .then(({ body }) => expect(body.msg).toBe('Invalid sort query'));
    });
    test('Invalid order query', () => {
      return request(app)
        .get('/api/articles?order=hjkl')
        .expect(400)
        .then(({ body }) => expect(body.msg).toBe('Invalid order query'));
    });
    test('Invalid filter query', () => {
      return request(app)
        .get('/api/articles?topic=waffles')
        .expect(400)
        .then(({ body }) => expect(body.msg).toBe('Invalid filter query'));
    });
  });
  describe('Status: 200 // OK:', () => {
    test('Returns articles sorted by date in descending by default', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy('created_at', { descending: true });
        });
    });
    test('Returns user-defined sorted and ordered result', () => {
      const sort_by = 'title';
      const order = 'asc';
      return request(app)
        .get('/api/articles')
        .query({ sort_by, order })
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy('title');
        });
    });
    test('Returns user-defined filter result', () => {
      const topic = 'mitch';
      return request(app)
        .get('/api/articles')
        .query({ topic })
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(11);
          articles.forEach((article) => {
            expect(article).toMatchObject({
              topic: 'mitch',
            });
          });
        });
    });
  });
});

describe('9. DELETE - /api/comments/:comment_id', () => {
  describe('Status: 400 // Bad requests:', () => {
    test('Missing comment ID', () => {
      return request(app)
        .delete('/api/comments/mangos')
        .expect(400)
        .then(({ body }) => expect(body.msg).toBe('Invalid comment ID'));
    });
  });
  describe('Status: 404 // Not found:', () => {
    test('Valid non-existent comment IDs', () => {
      return request(app)
        .delete('/api/comments/50000')
        .expect(404)
        .then(({ body }) => expect(body.msg).toBe('No comments found'));
    });
  });
  describe('Status: 204 // No content:', () => {
    test('Valid non-existent comment IDs', () => {
      return request(app).delete('/api/comments/3').expect(204);
    });
  });
});

describe('10. GET - /api/users/:username', () => {
  describe('Status: 400 // Bad requests:', () => {
    test('Valid non-existent username', () => {
      return request(app)
        .get('/api/users/mangos')
        .expect(404)
        .then(({ body }) => expect(body.msg).toBe('No user found'));
    });
  });
  describe('Status: 200 // OK:', () => {
    test('Returns an object', () => {
      return request(app)
        .get('/api/users/butter_bridge')
        .expect(200)
        .then(({ body }) => {
          const { user } = body;
          expect(user).toHaveProperty('username');
          expect(user).toHaveProperty('name');
          expect(user).toHaveProperty('avatar_url');
        });
    });
  });
});
