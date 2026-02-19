// const mongoose = require("mongoose");

// const connection = mongoose
//   .createConnection("mongodb://localhost:27017/TestDataBase")
//   .on("open", () => {
//     console.log("DB Connected");
//   })
//   .on("error", () => {
//     console.log("❌ DB connection error");
//   });

// module.exports = connection;

// require("dotenv").config();
// const { Client } = require("pg");

// const con = new Client({
//   host: process.env.HOST,
//   user: process.env.DB_USER,
//   port: process.env.DB_PORT,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
// });

// con
//   .connect()
//   .then(() => console.log("✅ PostgreSQL connected"))
//   .catch((err) => console.error("❌ DB connection error", err));

// module.exports = con;

require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
  },
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully");
  } catch (error) {
    console.error("❌ Unable to connect to database:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
