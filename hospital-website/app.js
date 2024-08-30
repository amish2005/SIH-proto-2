// app.js
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const db = require('./database');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session management
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Routes
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { name, number, email, age, gender, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (name, number, email, age, gender, password) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, number, email, age, gender, hashedPassword], (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? OR number = ?';
  db.query(sql, [username, username], async (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.user = user;
        res.redirect('/dashboard');
      } else {
        res.send('Incorrect password!');
      }
    } else {
      res.send('User not found!');
    }
  });
});

app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.send(`Welcome ${req.session.user.name}`);
  } else {
    res.redirect('/');
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
