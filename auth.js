const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = 'your-secret-key-change-this'; // ВАЖНО: поменяйте!

// Хеширование пароля
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Сравнение паролей
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// Создание JWT-токена
const createToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Проверка токена (middleware)
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Нет токена' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Неверный токен' });
    }
};

module.exports = {
    hashPassword,
    comparePassword,
    createToken,
    verifyToken,
    JWT_SECRET
};