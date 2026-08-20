const { connection } = require("../config/database");

function obtenerProductos(callback) {
  connection.query("SELECT * FROM products", callback);
}

function crearProducto(producto, callback) {
  connection.query("INSERT INTO products SET ?", producto, callback);
}

function actualizarProducto(id, producto, callback) {
  let query = "UPDATE products SET ";
  const values = [];

  if (producto.name) {
    query += "name=?, ";
    values.push(producto.name);
  }

  if (producto.description) {
    query += "description=?, ";
    values.push(producto.description);
  }

  if (producto.price) {
    query += "price=?, ";
    values.push(producto.price);
  }

  query = query.slice(0, -2);
  query += " WHERE id_product=?";
  values.push(id);

  connection.query(query, values, callback);
}

function eliminarProducto(id, callback) {
  connection.query("DELETE FROM products WHERE id_product = ?", id, callback);
}

function buscarProductoPorNombre(name, callback) {
  connection.query(
    "SELECT * FROM products WHERE name LIKE CONCAT('%', ?, '%')",
    name,
    callback,
  );
}

function buscarProductoPorId(id, callback) {
  connection.query("SELECT * FROM products WHERE id_product=?", id, callback);
}

module.exports = {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  buscarProductoPorNombre,
  buscarProductoPorId,
};
