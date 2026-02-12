const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize, testConnection } = require('./db');
const { setupRelations, syncDatabase } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

// Настройка связей между таблицами
setupRelations();

// Проверка БД и создание таблиц
testConnection().then(() => {
    syncDatabase();
});

app.get('/', (req, res) => {
    res.json({ 
        message: 'Добро пожаловать в API личного кабинета курсов!',
        status: 'работает',
        version: '1.0.0'
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на порту ${PORT}`);
    console.log(`📡 Доступен по адресу: http://localhost:${PORT}`);
    console.log(`🌐 Проверьте: http://localhost:${PORT}/api/health`);
});