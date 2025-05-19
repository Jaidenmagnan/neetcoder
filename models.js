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
    username: Sequelize.STRING,
    message_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
});

module.exports = { Users, Sequelize };
