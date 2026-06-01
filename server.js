const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/cars', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'cars.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'register.html')));
app.get('/bookings', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'bookings.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  ✅  Server running!`);
  console.log(`  🌐  Open: http://localhost:${PORT}\n`);
});