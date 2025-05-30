const Sequelize = require('sequelize');
const { defaultValueSchemable } = require('sequelize/lib/utils');
require('dotenv').config();

let sequelize;

try {
  if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  } else {
    // local db
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        port: process.env.DB_PORT,
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
  }

  // test
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection established successfully.');
    })
    .catch(err => {
      console.error('❌ Unable to connect to the database:', err);
    });
} catch (error) {
  console.error('❌ Database configuration error:', error);
  process.exit(1);
}

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
    messageid: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '',
    },
    votes_needed: {
      type:Sequelize.INTEGER,
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
      type:Sequelize.STRING,
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

const RunChannels = sequelize.define('run_channels', {
  guild_id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
  },
  channel_id: {
      type: Sequelize.STRING,
      allowNull: false
  }
});

module.exports = { Users, Sequelize, Configurations, ReactionRoles, Votes, StravaUsers, RunChannels };
