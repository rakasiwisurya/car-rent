const mysql = require("mysql2");

const connectionPool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: null,
  database: "db_car_rent",
  connectionLimit: 5,
});

module.exports = connectionPool;
