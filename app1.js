require('dotenv').config();

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { createPool } = require('mysql2');
const jwt = require('jsonwebtoken');



const app = express();

app.set('appName', 'DopMPT'); 

app.use(express.urlencoded({extended: true}));

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.static('public'));
app.use(express.static('public1'));
app.use(express.static('views'));
app.use(express.static('/'));

const { exec } = require('child_process');
const { json } = require('body-parser');

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

const PORT = 3000;
const HOSTNAME = 'localhost';     // const HOSTNAME = '172.25.80.1';

const pool = createPool({
    'host': "localhost",
    'user': "user",
    'password': "root12345",
    'database': "DopMPT",
});

const createPath = (page) => path.resolve(__dirname, 'views', `${page}.html`);

app.listen(PORT, HOSTNAME, (error) => {
    error ? console.log(error) : console.log(`listening port ${HOSTNAME}:${PORT}`);
});


app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.get('/home', (req, res) => {
    res.render('index.html');
});

app.get('/pdf', (req, res) => {
    const title = 'PDF';
    res.render(createPath('pdf'), {title});
});

app.get('/lookpdf', (req, res) => {
    const title = 'Look PDF';
    res.render(createPath('look_pdf'), {title});
});

app.get('/allthemes', (req, res) => {
    const sql = 'SELECT * FROM Theme';
    pool.query(sql, (error, result) => {
        if(error){
            console.error('Ошибка запроса: ' + error.message);
            res.status(500).send('Ошибка сервера');
            return;
        }
        res.json(result);
        console.log(result);
    });
    return;
});

app.get('/register', (req, res) => {
    res.sendFile('/public/registerAdmin.html');
  });

app.get('/userPosts/', (req, res) => {
    try {
    const sql = `
    SELECT * FROM Administrator
    INNER JOIN Post ON Administrator.Post_ID = Post.ID_Post;  
    `;
    pool.query(sql, (error, results) => {
      if (error) {
        console.error('Ошибка запроса: ' + error.message);
        res.status(500).send('Ошибка сервера');
        return;
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Ошибка при получении пользователей', error);
    res.status(500).send('Ошибка сервера');
  }
  });
app.delete('/userPosts/:userId', (req, res) => {
    const userId = req.params.userId;
    pool.query('DELETE FROM Administrator WHERE ID_Administrator = ?', userId, (error, results, fields) => {
      if (error) {
        res.status(500).json({ error: 'Failed to delete user' });
      } else {
        res.status(200).json({ message: 'User deleted successfully' });
      }
    });
  });


//   app.post('/download-file:fileName', upload.single('file'), (req, res) => {
//     const file = req.file;
  
//     if (!file) {
//       return res.status(400).send('Файл не был загружен');
//     }
  

  

//   });

