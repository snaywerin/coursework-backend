const { DataTypes } = require('sequelize');
const { sequelize } = require('./db');

// ===== МОДЕЛЬ ПОЛЬЗОВАТЕЛЯ =====
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    avatar_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    role: {
        type: DataTypes.STRING(20),
        defaultValue: 'student',
        validate: { isIn: [['student', 'admin']] }
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// ===== МОДЕЛЬ КУРСА =====
const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// ===== МОДЕЛЬ УРОКА =====
const Lesson = sequelize.define('Lesson', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Courses',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    video_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    order_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// ===== МОДЕЛЬ ЗАПИСИ НА КУРС =====
const UserCourse = sequelize.define('UserCourse', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Courses',
            key: 'id'
        }
    },
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0, max: 100 }
    },
    enrolled_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: false
});

// ===== МОДЕЛЬ ПРОГРЕССА ПО УРОКАМ =====
const UserLesson = sequelize.define('UserLesson', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Lessons',
            key: 'id'
        }
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: false
});

// ===== СВЯЗИ МЕЖДУ ТАБЛИЦАМИ =====
const setupRelations = () => {
    // Курс → Уроки (1 ко многим)
    Course.hasMany(Lesson, { foreignKey: 'course_id' });
    Lesson.belongsTo(Course, { foreignKey: 'course_id' });

    // Пользователь → Записи на курсы (1 ко многим)
    User.hasMany(UserCourse, { foreignKey: 'user_id' });
    UserCourse.belongsTo(User, { foreignKey: 'user_id' });
    
    // Курс → Записи на курсы (1 ко многим)
    Course.hasMany(UserCourse, { foreignKey: 'course_id' });
    UserCourse.belongsTo(Course, { foreignKey: 'course_id' });

    // Пользователь → Прогресс по урокам (1 ко многим)
    User.hasMany(UserLesson, { foreignKey: 'user_id' });
    UserLesson.belongsTo(User, { foreignKey: 'user_id' });
    
    // Урок → Прогресс по урокам (1 ко многим)
    Lesson.hasMany(UserLesson, { foreignKey: 'lesson_id' });
    UserLesson.belongsTo(Lesson, { foreignKey: 'lesson_id' });
};

// ===== ФУНКЦИЯ СОЗДАНИЯ ТАБЛИЦ =====
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Все таблицы созданы/обновлены!');
    } catch (error) {
        console.error('❌ Ошибка создания таблиц:', error.message);
    }
};

module.exports = {
    User,
    Course,
    Lesson,
    UserCourse,
    UserLesson,
    setupRelations,
    syncDatabase
};