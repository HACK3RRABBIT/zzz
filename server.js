const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data/movies.json');
const JWT_SECRET = 'your_jwt_secret'; // Replace with a strong secret in a real app

// Dummy admin user
const ADMIN_USER = {
    username: 'admin',
    password: 'password' // In a real app, use hashed passwords
};

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Read data from JSON file
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

// Write data to JSON file
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// API Endpoints
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
        const user = { name: username };
        const accessToken = jwt.sign(user, JWT_SECRET);
        res.json({ accessToken: accessToken });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.get('/api/movies', (req, res) => {
    const movies = readData();
    res.json(movies);
});

app.post('/api/movies', authenticateToken, (req, res) => {
    const movies = readData();
    const newMovie = { id: Date.now().toString(), ...req.body };
    movies.push(newMovie);
    writeData(movies);
    res.status(201).json(newMovie);
});

app.put('/api/movies/:id', authenticateToken, (req, res) => {
    const movies = readData();
    const index = movies.findIndex(m => m.id === req.params.id);
    if (index !== -1) {
        movies[index] = { ...movies[index], ...req.body };
        writeData(movies);
        res.json(movies[index]);
    } else {
        res.status(404).send('Movie not found');
    }
});

app.delete('/api/movies/:id', authenticateToken, (req, res) => {
    let movies = readData();
    const initialLength = movies.length;
    movies = movies.filter(m => m.id !== req.params.id);
    if (movies.length < initialLength) {
        writeData(movies);
        res.status(204).send();
    } else {
        res.status(404).send('Movie not found');
    }
});

app.post('/api/upload', authenticateToken, upload.single('poster'), (req, res) => {
    if (req.file) {
        res.json({ filePath: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).send('No file uploaded.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});