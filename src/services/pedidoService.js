const { connection } = require("../config/database");

function obtenerPedidos(userId, callback) {
  if (userId) {
    return connection.query(
      "SELECT * FROM pedidos WHERE user_id = ?",
      userId,
      callback,
    );
  }
  connection.query("SELECT * FROM pedidos", callback);
}

function crearPedido(pedido, callback) {
  connection.query("INSERT INTO pedidos SET ?", pedido, callback);
}

function actualizarPedido(id, pedido, userId, callback) {
  let query = "UPDATE pedidos SET ";
  const values = [];
  if (pedido.fecha) {
    query += "fecha=?, ";
    values.push(pedido.fecha);
  }
  if (pedido.state) {
    query += "state=?, ";
    values.push(pedido.state);
  }
  if (pedido.total) {
    query += "total=?, ";
    values.push(pedido.total);
  }
  if (pedido.user_id) {
    query += "user_id=?, ";
    values.push(pedido.user_id);
  }
  if (values.length === 0) return callback(new Error("No fields to update"));

  query = query.slice(0, -2);
  if (userId) {
    query += " WHERE id_pedido=? AND user_id=?";
    values.push(id, userId);
  } else {
    query += " WHERE id_pedido=?";
    values.push(id);
  }
  connection.query(query, values, callback);
}

function eliminarPedido(id, userId, callback) {
  if (userId) {
    return connection.query(
      "DELETE FROM pedidos WHERE id_pedido = ? AND user_id = ?",
      [id, userId],
      callback,
    );
  }
  connection.query("DELETE FROM pedidos WHERE id_pedido = ?", id, callback);
}

function buscarPedidoPorUsuario(userId, callback) {
  connection.query("SELECT * FROM pedidos WHERE user_id = ?", userId, callback);
}

function buscarPedidoPorId(idPedido, userId, callback) {
  if (userId) {
    return connection.query(
      "SELECT * FROM pedidos WHERE id_pedido = ? AND user_id = ?",
      [idPedido, userId],
      callback,
    );
  }
  connection.query(
    "SELECT * FROM pedidos WHERE id_pedido = ?",
    idPedido,
    callback,
  );
}

function recalcularTotal(idPedido, callback) {
  connection.query(
    // El coalesce es para devolver el primer valor no nulo. suma el precio de todos los productos del carrito actual.
    `SELECT COALESCE(SUM(d.quantity * p.price), 0) AS total
     FROM detalles d INNER JOIN products p ON p.id_product = d.product_id
     WHERE d.pedido_id = ?`,
    idPedido,
    (err, rows) => {
      if (err) return callback(err);
      connection.query(
        "UPDATE pedidos SET total = ? WHERE id_pedido = ?",
        [rows[0].total, idPedido],
        callback,
      );
    },
  );
}

module.exports = {
  obtenerPedidos,
  crearPedido,
  actualizarPedido,
  eliminarPedido,
  buscarPedidoPorUsuario,
  buscarPedidoPorId,
  recalcularTotal,
};
