require('dotenv').config();

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const { createPool } = require('mysql2');


app.set('appName', 'DopMPT'); //  имя приложения в Express

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Разрешить запросы от всех источников (*)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
const PORT = 3001;
const HOSTNAME = 'localhost';

const pool = createPool({
  'host': "localhost",
  'user': "user",
  'password': "root12345",
  'database': "DopMPT",
});

const connection = mysql.createConnection ({
  'host': 'localhost',
  'user': 'root',
  'password': 'root12345',
  'database': 'DopMPT'
});

connection.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
    throw err;
  }
  console.log('Успешное подключение к базе данных');
});


app.post('/token', (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  
  pool.query('SELECT * FROM user_tokens WHERE refresh_token = ?', refreshToken, (err, results) => {
    if (err) {
      console.error('Ошибка при поиске refresh токена:', err);
      return res.sendStatus(500);
    }
    if (results.length === 0) return res.sendStatus(403);
    
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = generateAccessToken({ name: user.name });
      res.json({ accessToken: accessToken });
    });
  });
});

app.delete('/logout', (req, res) => {
  const refreshToken = req.body.token;
  pool.query('DELETE FROM user_tokens WHERE refresh_token = ?', refreshToken, (err) => {
    if (err) {
      console.error('Ошибка при удалении refresh токена:', err);
      return res.sendStatus(500);
    }
    res.sendStatus(204);
  });
});


app.post('/login', (req, res) => {
  // const { Email_admin, Password_admin } = req.body;
  const Email_admin = req.body.Email_admin;
  const Password_admin = req.body.Password_admin;

  const comparePassword = async (Password_admin, hash) => {
    try {
      return await bcrypt.compare(Password_admin, hash);
    } catch (error) {
      console.log(error);
    }
    return false;
  }
  console.log(Password_admin);
  console.log(comparePassword);
  
  pool.query('SELECT * FROM Administrator WHERE Email_admin = ?', [Email_admin], (err, results) => {
    if (err) {
      console.error('Ошибка при поиске пользователя:', err);
      return res.sendStatus(500);
    }
    const isValid = comparePassword(Password_admin, results[0].Password_admin);
    console.log(`fgfg ${!isValid ? 'not' : 'valid'}`);
    if (results.length === 0) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    console.log(results[0].Password_admin);
    const user = {
      id: results[0].ID_Administrator, 
      Email_admin: Email_admin,
      Password_admin: Password_admin
    };
    console.log(user);
    console.log('0');
    const accessToken = generateAccessToken(user);
    console.log('1');
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    console.log('2');
    
    pool.query('UPDATE user_tokens SET refresh_token = ? WHERE id_user = ?', [refreshToken, results[0].ID_Administrator], (err) => {
      if (err) {
        console.log('3');
        console.error('Ошибка при обновлении refresh токена:', err);
        return res.sendStatus(500);
      }
      console.log(user.id, accessToken,'\n\n\n' + refreshToken);
      res.json({ id: user.id, accessToken: accessToken, refreshToken: refreshToken });
    });
  });
});



function generateAccessToken(user){ 
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m'});
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

const bcrypt = require('bcrypt');
const saltRounds = 10; 



app.post('/register', (req, res) => {
  const userData = req.body;

  bcrypt.hash(userData.Password_admin, saltRounds, (err, hash) => {
    if (err) {
      console.error('Ошибка при хешировании пароля:', err);
      return res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
    }

    // userData.Password_admin = hash;
    userData.Password_admin = 'L2i0z0a2!@';

    const attributesToHash = [
      'Password_admin'
    ];

    const hashAttributes = () => {
      const attribute = attributesToHash.shift();
      if (!attribute) {
        pool.query('INSERT INTO Administrator SET ?', userData, (err, result) => {
          if (err) {
            console.error('Ошибка при сохранении данных пользователя:', err);
            return res.status(500).json({ error: 'Ошибка при сохранении данных пользователя' });
          }
          res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
        });
        // pool.query('INSERT INTO user_tokens(access_token, id_user) values(?, ?)', userData.Password_admin, (err, result) => {
        //   if (err) {
        //     console.error('Ошибка при сохранении данных пользователя:', err);
        //     return res.status(500).json({ error: 'Ошибка при сохранении данных пользователя' });
        //   }
        //   res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
        // });
      } else {
        bcrypt.hash(userData.Password_admin, saltRounds, (err, hash) => {
          if (err) {
            console.error('Ошибка при хешировании пароля:', err);
            return res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
          }
        
          userData.Password_admin = hash;
          hashAttributes();        
        });
      }
    };

    hashAttributes();
  });
});

app.get('/current-user', authenticateToken, (req, res) => {
  res.json({ username: req.user.name });
});

app.listen(3001);
// app.listen(PORT, HOSTNAME, (error) => {
//   error ? console.log(error) : console.log(`listening port ${HOSTNAME}:${PORT}`);
// });