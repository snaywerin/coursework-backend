const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'simple-secret-key-2026';

// ВРЕМЕННАЯ БАЗА ДАННЫХ В ПАМЯТИ
const users = [];

// РЕГИСТРАЦИЯ
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: users.length + 1,
            email,
            password: hashedPassword,
            name,
            role: 'student',
            created_at: new Date().toISOString()
        };
        
        users.push(newUser);
        
        const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({
            message: 'Регистрация успешна',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ВХОД
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email и пароль обязательны' });
        }

        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            message: 'Вход выполнен успешно',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ПРОФИЛЬ
app.get('/api/profile', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Нет токена' });
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.id);
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
        
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: user.created_at
        });
    } catch (error) {
        res.status(401).json({ error: 'Неверный токен' });
    }
});

// ГЛАВНАЯ
app.get('/', (req, res) => {
    res.json({ 
        message: 'Добро пожаловать в API личного кабинета курсов!',
        status: 'работает',
        version: '1.0.0',
        auth: '/api/auth/register и /api/auth/login'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на порту ${PORT}`);
    console.log(`🔐 Регистрация: POST /api/auth/register`);
    console.log(`🔑 Вход: POST /api/auth/login`);
});