const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize, testConnection } = require('./db');
const { User } = require('./models');
const { hashPassword, comparePassword, createToken, verifyToken } = require('./auth');

const app = express();

app.use(cors());
app.use(express.json());

// ========== РЕГИСТРАЦИЯ ==========
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Проверка на пустые поля
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }
        
        // Проверка, существует ли пользователь
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь уже существует' });
        }
        
        // Хешируем пароль и создаём пользователя
        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            email,
            password_hash: hashedPassword,
            name,
            role: 'student'
        });
        
        // Создаём токен
        const token = createToken(user.id);
        
        res.status(201).json({
            message: 'Регистрация успешна',
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

// ========== ВХОД ==========
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Проверка на пустые поля
        if (!email || !password) {
            return res.status(400).json({ error: 'Email и пароль обязательны' });
        }
        
        // Ищем пользователя
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        // Проверяем пароль
        const isValid = await comparePassword(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        // Создаём токен
        const token = createToken(user.id);
        
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

// ========== ПРИМЕР ЗАЩИЩЁННОГО РОУТА ==========
app.get('/api/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: ['id', 'email', 'name', 'role', 'avatar_url', 'created_at']
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== ПУБЛИЧНЫЕ РОУТЫ ==========
app.get('/', (req, res) => {
    res.json({ 
        message: 'Добро пожаловать в API личного кабинета курсов!',
        status: 'работает',
        version: '1.0.0',
        auth: '/api/auth/register и /api/auth/login'
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'personal-courses-api',
        database: 'connected'
    });
});

// ========== ЗАПУСК ==========
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на порту ${PORT}`);
    console.log(`📡 Доступен по адресу: http://localhost:${PORT}`);
    console.log(`🔐 Регистрация: POST /api/auth/register`);
    console.log(`🔑 Вход: POST /api/auth/login`);
});