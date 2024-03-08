const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_SECRET = 'session_secret_key'; 
const SESSION_EXPIRATION = '1d'; 

class Session {
  #sessions = {};

  constructor() {
    try {
      const data = fs.readFileSync('./sessions.json', 'utf8');
      this.#sessions = JSON.parse(data.trim());
    } catch (e) {
      this.#sessions = {};
    }
  }

  #storeSessions() {
    fs.writeFileSync('./sessions.json', JSON.stringify(this.#sessions), 'utf-8');
  }

  set(key, value) {
    this.#sessions[key] = value;
    this.#storeSessions();
  }

  get(key) {
    return this.#sessions[key];
  }

  init() {
    const sessionId = jwt.sign({}, SESSION_SECRET, { expiresIn: SESSION_EXPIRATION });
    this.set(sessionId, {});
    return sessionId;
  }

  destroy(sessionId) {
    delete this.#sessions[sessionId];
    this.#storeSessions();
  }
}

const sessions = new Session();

app.use((req, res, next) => {
  let currentSession = {};
  let sessionId = req.headers.authorization;

  if (sessionId) {
    try {
      currentSession = jwt.verify(sessionId, SESSION_SECRET);
    } catch (err) {
      sessionId = sessions.init();
    }
  } else {
    sessionId = sessions.init();
  }

  req.session = currentSession;
  req.sessionId = sessionId;

  res.on('finish', () => {
    const currentSession = req.session;
    const sessionId = req.sessionId;
    sessions.set(sessionId, currentSession);
  });

  next();
});

app.get('/', (req, res) => {
  if (req.session.username) {
    return res.json({
      username: req.session.username,
      logout: 'http://localhost:3000/logout'
    });
  }
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/logout', (req, res) => {
  sessions.destroy(req.sessionId);
  res.redirect('/');
});

const users = [
  {
    login: 'Login',
    password: 'Password',
    username: 'Username',
  },
  {
    login: 'Login1',
    password: 'Password1',
    username: 'Username1',
  }
];

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  const user = users.find((user) => user.login === login && user.password === password);

  if (user) {
    const token = jwt.sign({ username: user.username, login: user.login }, SESSION_SECRET, { expiresIn: SESSION_EXPIRATION });
    res.json({ token });
  } else {
    res.status(401).send();
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
