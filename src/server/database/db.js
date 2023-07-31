const mysql2 = require("mysql2");

// const connection = mysql2.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "cashier_app",
//   multipleStatements: true,
// });

const connection = mysql2.createConnection({
  host: "api.cashier-app.mikofirnando.my.id",
  user: "mikofirn_admin",
  password: "og,zkZ%sK9FC",
  database: "mikofirn_cashier_app",
  multipleStatements: true,
});

module.exports = connection;
