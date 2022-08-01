# <b>Jamals NC News </b> 📰

<p>This is a working document. If you're reading this, you know why you're here 😀</p>

<p>Here's some instructions to get started, well clean the rest of this shizzle up later!</p>

---

## 🔌 <b>JUMPSTART</b>

<br></br>

### DEPENDENCIES 🫴

<p>To install the dependencies used you will need to use the prompt:

`npm i `

They should include: dotenv, express, postgres, supertest, jest, jest-sorted, jest-extended, husky and pg-format. They should be in the package.json like this:<br></p>
<code>TBA</code>

### SETUP DATABASE 📂

<p>You will need to make sure you connect the two databases; development and test.
To do this you will need to create individual .env files using the .env-example as a template.<br>

You will require a **.env.test** and a **.env.development** file to be able to connect to the appropriate database.
⚠️ Contact the owner for the database names</p>

Once the **.env files** You will need to install [dotenv](https://www.npmjs.com/package/dotenv)

<p>Finally, you will need to seed the databases, otherwise the app will not find any data. To do this first run the command

`npm run setup-dbs `

this will setup the database to seed it run: </p>

`npm run seed `

and finally to allow the server to listen for requests use:

`npm run start `

The server will now be able to respond to request. A program like insomnia will allow you to send requests and view the responses from the api.

---