const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.log("Error de conexión:", err);
  } else {
    console.log("Conectado a MySQL");
  }
});

function withTransaction(fn, callback) {
  connection.beginTransaction((err) => {
    if (err) return callback(err);
    fn(connection, (err) => {
      if (err) return connection.rollback(() => callback(err));
      connection.commit((err) => {
        if (err) return connection.rollback(() => callback(err));
        callback(null);
      });
    });
  });
}

module.exports = { connection, withTransaction };
