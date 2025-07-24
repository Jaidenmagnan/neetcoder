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
          }
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

const ChannelStats = sequelize.define('channel_stats', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    message_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    channel_id: {
        type: Sequelize.STRING,
        defaultValue: 1,
        allowNull: false,
    },
    guild_id: {
        type: Sequelize.STRING,
        defaultValue: 1,
        allowNull: false,
    },
});

const UserAuth = sequelize.define('user_auth', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    discordId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    userName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    avatar: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
    },
});

const Guilds = sequelize.define('guilds', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    guildid: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    guildname: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    guildicon: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
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
    messageid: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
    },
    votes_needed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    length_of_timeout: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    userid: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 0,
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

const Votes = sequelize.define('votes', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    guildid: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    messageid: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    userid: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    votestatus: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

// these roles are assigned to a GROUP
const Roles = sequelize.define('roles', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    roleGroupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    guildId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    emoji: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    roleId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

const RoleGroups = sequelize.define('role_groups', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    guildId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    messageId: {
        type: Sequelize.STRING,
        allowNull: true,
    },
});

const Books = sequelize.define('books', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    status: {
        type: Sequelize.ENUM('read', 'unread'),
        defaultValue: 'unread',
        allowNull: false,
    },
});

module.exports = {
    Guilds,
    ChannelStats,
    UserAuth,
    Users,
    Sequelize,
    Configurations,
    Roles,
    RoleGroups,
    Votes,
    Books,
};
