# Papers (Backend)
![Papers logo](./PaperLogoLight.png "Papers logo")

**Papers** is a reddit-style web app allowing users to read, comment, and like articles contributed by other users as well as posting article themselves. 

Hosted at:
https://be-nc-news-jwm.herokuapp.com/api 🔗

This repo handles Paper's backend codebase. You can see check out the frontend [repo here](https://github.com/jamalxwm/fe-nc-news).

## Project Summary 🗒

This project creates an API for programmatically accecessing and updating the application database. The API mimics a real-world backend service for providing data to a frontend architecture. 

## Tech Stack 💾

- PostgreSQL (database)
- Express.JS (server)
- Node-postgres (cli)

## Getting Started

To inspect this project (or build your own!) locally start by forking and cloning this repository.

### Prerequisites

At a minimum your machine will need Node.js and Postgres installed.

## Installation

You can install the neccesary dependencies with the following command:

```
npm install
```

This will install following dependencies from package.json:
- CORS
- Dotenv
- Express
- PG

To install optional dev dependencies for testing run the following command

```
npm install -D
```

This will install following dependencies to the project:
- Husky 
- Jest
- Jest-extended
- Jest-sorted
- PG-format
- Supertest

## Seed Database

There are premade scripts defined in package.json for seeding the database. You can run this with the following two commands:

```
npm run setup-dbs
npm run seed
```
## Setup .env Files

Along with the node_modules the .env files have also been ignored in this repo. You will need to set these up yourself. To do this:

 1. Create `.env.development` and `.env.test` in the projects root folder.
 2. Add `PGDATABASE=nc_news` to connect to the main development database. 
 3. Add `PGDATABASE=nc_news_test` to connect to the test database
 4. Add the `.env.*` to .gitignore

## Testing

To test the endpoints are working correctly, run the following command;

```
npm test
```

This will run all tests in the `app.test.js` file. 
