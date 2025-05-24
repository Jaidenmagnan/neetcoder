const Sequelize = require('sequelize');
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
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
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
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
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

const ReactionRoles = sequelize.define('reaction_roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    messageid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    guildid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    emoji: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    roleid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
});

// new database for strava integration
const StravaUsers = sequelize.define('strava_users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    discord_user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    strava_athlete_id: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    access_token: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    refresh_token: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    athlete_data: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

module.exports = { Users, Sequelize, Configurations, ReactionRoles, StravaUsers };
