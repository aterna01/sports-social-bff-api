require('dotenv').config()

const config = {
  DB_NAME: process.env.DB_NAME,
  MONGO_DB_CONN_STRING: process.env.MONGO_DB_CONN_STRING,
  FRONTEND_URL: process.env.FRONTEND_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
};

module.exports = config;
