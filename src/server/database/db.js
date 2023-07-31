const mysql2 = require("mysql2");

// const connection = mysql2.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "cashier_app",
//   multipleStatements: true,
// });

const connection = mysql2.createConnection({
  host: "https://api-cashier-app.cyclic.cloud",
  user: "mikofirn_admin",
  password: "og,zkZ%sK9FC",
  database: "mikofirn_cashier_app",
  multipleStatements: true,
});

connection.connect((err) => {
  if (err) {
    console.log("Database Failed To Connected!");
  } else {
    console.log("Database connected successfully");
  }
});

module.exports = connection;
