const { connection } = require("../config/database");
const { recalcularTotal } = require("./pedidoService");

function obtenerDetalles(userId, callback) {
  if (userId) {
    return connection.query(
      "SELECT d.* FROM detalles d INNER JOIN pedidos p ON p.id_pedido = d.pedido_id WHERE p.user_id = ?",
      userId,
      callback,
    );
  }
  connection.query(
    "SELECT d.* FROM detalles d INNER JOIN pedidos p ON p.id_pedido = d.pedido_id",
    callback,
  );
}

function crearDetalle(detalle, callback) {
  connection.query("INSERT INTO detalles SET ?", detalle, (err, results) => {
    if (err) return callback(err);
    recalcularTotal(detalle.pedido_id, (err2) => callback(err2, results));
  });
}

function actualizarDetalle(detalle, id, userId, callback) {
  let query =
    "UPDATE detalles d INNER JOIN pedidos p ON p.id_pedido = d.pedido_id SET ";
  const values = [];
  if (detalle.product_id) {
    query += "d.product_id=?, ";
    values.push(detalle.product_id);
  }
  if (detalle.quantity) {
    query += "d.quantity=?, ";
    values.push(detalle.quantity);
  }
  if (values.length === 0) return callback(new Error("No fields to update"));
  query = query.slice(0, -2);
  if (userId) {
    query += " WHERE d.id_detalle = ? AND p.user_id = ?";
    values.push(id, userId);
  } else {
    query += " WHERE d.id_detalle = ?";
    values.push(id);
  }
  connection.query(query, values, (err, results) => {
    if (err) return callback(err);
    connection.query(
      "SELECT pedido_id FROM detalles WHERE id_detalle = ?",
      id,
      (err2, rows) => {
        if (err2) return callback(err2);
        if (!rows.length) return callback(null, results);
        recalcularTotal(rows[0].pedido_id, (err3) => callback(err3, results));
      },
    );
  });
}

function eliminarDetalle(id, userId, callback) {
  const selectQuery = userId
    ? "SELECT d.pedido_id FROM detalles d INNER JOIN pedidos p ON p.id_pedido = d.pedido_id WHERE d.id_detalle = ? AND p.user_id = ?"
    : "SELECT pedido_id FROM detalles WHERE id_detalle = ?";
  const selectArgs = userId ? [id, userId] : [id];

  connection.query(selectQuery, selectArgs, (err, rows) => {
    if (err) return callback(err);
    if (!rows || rows.length === 0) return callback(null, { affectedRows: 0 });
    const pedido_id = rows[0].pedido_id;

    const deleteQuery = userId
      ? "DELETE d FROM detalles d INNER JOIN pedidos p ON p.id_pedido = d.pedido_id WHERE d.id_detalle = ? AND p.user_id = ?"
      : "DELETE FROM detalles WHERE id_detalle = ?";
    const deleteArgs = userId ? [id, userId] : [id];

    connection.query(deleteQuery, deleteArgs, (err2, results) => {
      if (err2) return callback(err2);
      recalcularTotal(pedido_id, (err3) => callback(err3, results));
    });
  });
}

function buscarDetallePorPedido(idPedido, userId, callback) {
  if (userId) {
    return connection.query(
      "SELECT d.* FROM detalles d INNER JOIN pedidos p ON p.id_pedido = d.pedido_id WHERE d.pedido_id = ? AND p.user_id = ?",
      [idPedido, userId],
      callback,
    );
  }
  connection.query(
    "SELECT d.* FROM detalles WHERE pedido_id = ?",
    idPedido,
    callback,
  );
}

function buscarDetallePorId(idDetalle, userId, callback) {
  if (userId) {
    return connection.query(
      "SELECT d.* FROM detalles d INNER JOIN pedidos p ON p.id_pedido = d.pedido_id WHERE d.id_detalle = ? AND p.user_id = ?",
      [idDetalle, userId],
      callback,
    );
  }
  connection.query(
    "SELECT * FROM detalles WHERE id_detalle = ?",
    idDetalle,
    callback,
  );
}

function pedidoPerteneceAUsuario(pedidoId, userId, callback) {
  connection.query(
    "SELECT * FROM pedidos WHERE id_pedido = ? AND user_id = ?",
    [pedidoId, userId],
    callback,
  );
}

module.exports = {
  obtenerDetalles,
  crearDetalle,
  actualizarDetalle,
  eliminarDetalle,
  buscarDetallePorPedido,
  buscarDetallePorId,
  pedidoPerteneceAUsuario,
};
