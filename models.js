const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'db/database.sqlite',
});

// this is how we make a database table
const Users = sequelize.define('users', {
    userid: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    message_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    level: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false,
    },
});

const Configurations = sequelize.define('configurations', {
    field: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
    },
    channel: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
    },
});

module.exports = { Users, Sequelize, Configurations };
