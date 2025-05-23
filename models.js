const Sequelize = require('sequelize');
const { defaultValueSchemable } = require('sequelize/lib/utils');
require('dotenv').config();

const sequelize = process.env.DATABASE_URL 
  ? // production db
    new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  : // local db
    new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS, 
      {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        port: process.env.DB_PORT,
        logging: false,
      },
    );

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
    guildid: {
      type: Sequelize.STRING,
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
    guildid: {
      type: Sequelize.STRING,
      defaultValue: 1,
      allowNull: false,
    },
});

module.exports = { Users, Sequelize, Configurations };
