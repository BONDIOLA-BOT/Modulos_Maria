const { connection } = require("../config/database");
const { recalcularTotal } = require("./pedidoService");

function buscarCarritoActivo(userId, callback) {
  connection.query(
    "SELECT * FROM pedidos WHERE user_id = ? AND state = 'Carrito'",
    userId,
    (err, results) => {
      if (err) return callback(err);
      const pedido = results.length > 0 ? results[0] : null;
      if (!pedido) return callback(null, null);

      connection.query(
        "SELECT d.id_detalle, d.product_id, d.pedido_id, d.quantity, p.name, p.price, p.stock FROM detalles d INNER JOIN products p ON d.product_id = p.id_product WHERE d.pedido_id = ?",
        pedido.id_pedido,
        (err, items) => {
          if (err) return callback(err);
          callback(null, { pedido, items });
        },
      );
    },
  );
}

function agregarItem(userId, productId, quantity, callback) {
  buscarCarritoActivo(userId, (err, cart) => {
    if (err) return callback(err);

    const crearCarrito = (cb) => {
      connection.query(
        "INSERT INTO pedidos (user_id, state, fecha, total) VALUES (?, 'Carrito', NOW(), 0)",
        userId,
        (err, result) => {
          if (err) return cb(err);
          cb(null, { id_pedido: result.insertId });
        },
      );
    };

    const continuar = (pedido) => {
      connection.query(
        "SELECT * FROM products WHERE id_product = ?",
        productId,
        (err, products) => {
          if (err) return callback(err);
          if (!products || products.length === 0) {
            return callback(new Error("Producto no encontrado"));
          }

          const product = products[0];

          connection.query(
            "SELECT * FROM detalles WHERE pedido_id = ? AND product_id = ?",
            [pedido.id_pedido, productId],
            (err, existing) => {
              if (err) return callback(err);

              if (existing.length > 0) {
                const newQty = existing[0].quantity + quantity;
                if (newQty > product.stock) {
                  return callback(
                    new Error("Stock insuficiente"),
                  );
                }
                connection.query(
                  "UPDATE detalles SET quantity = ? WHERE id_detalle = ?",
                  [newQty, existing[0].id_detalle],
                  (err) => {
                    if (err) return callback(err);
                    recalcularTotal(pedido.id_pedido, (err2) => {
                      if (err2) return callback(err2);
                      buscarCarritoActivo(userId, callback);
                    });
                  },
                );
              } else {
                if (quantity > product.stock) {
                  return callback(
                    new Error("Stock insuficiente"),
                  );
                }
                connection.query(
                  "INSERT INTO detalles (pedido_id, product_id, quantity) VALUES (?, ?, ?)",
                  [pedido.id_pedido, productId, quantity],
                  (err) => {
                    if (err) return callback(err);
                    recalcularTotal(pedido.id_pedido, (err2) => {
                      if (err2) return callback(err2);
                      buscarCarritoActivo(userId, callback);
                    });
                  },
                );
              }
            },
          );
        },
      );
    };

    if (cart) {
      continuar(cart.pedido);
    } else {
      crearCarrito((err, pedido) => {
        if (err) return callback(err);
        continuar(pedido);
      });
    }
  });
}

function actualizarItem(idDetalle, userId, quantity, callback) {
  const selectQuery =
    "SELECT d.id_detalle, d.pedido_id, d.product_id FROM detalles d INNER JOIN pedidos p ON p.id_pedido = d.pedido_id WHERE d.id_detalle = ? AND p.user_id = ? AND p.state = 'Carrito'";

  connection.query(selectQuery, [idDetalle, userId], (err, rows) => {
    if (err) return callback(err);
    if (!rows || rows.length === 0) {
      return callback(new Error("Item no encontrado en tu carrito"));
    }

    const item = rows[0];

    connection.query(
      "SELECT stock FROM products WHERE id_product = ?",
      item.product_id,
      (err, products) => {
        if (err) return callback(err);
        if (!products || products.length === 0) {
          return callback(new Error("Producto no encontrado"));
        }
        if (quantity > products[0].stock) {
          return callback(new Error("Stock insuficiente"));
        }

        connection.query(
          "UPDATE detalles SET quantity = ? WHERE id_detalle = ?",
          [quantity, idDetalle],
          (err) => {
            if (err) return callback(err);
            recalcularTotal(item.pedido_id, (err2) => {
              if (err2) return callback(err2);
              buscarCarritoActivo(userId, callback);
            });
          },
        );
      },
    );
  });
}

function eliminarItem(idDetalle, userId, callback) {
  const selectQuery =
    "SELECT d.id_detalle, d.pedido_id FROM detalles d INNER JOIN pedidos p ON p.id_pedido = d.pedido_id WHERE d.id_detalle = ? AND p.user_id = ? AND p.state = 'Carrito'";

  connection.query(selectQuery, [idDetalle, userId], (err, rows) => {
    if (err) return callback(err);
    if (!rows || rows.length === 0) {
      return callback(new Error("Item no encontrado en tu carrito"));
    }

    const pedido_id = rows[0].pedido_id;

    connection.query("DELETE FROM detalles WHERE id_detalle = ?", [idDetalle], (err) => {
      if (err) return callback(err);
      recalcularTotal(pedido_id, (err2) => {
        if (err2) return callback(err2);
        buscarCarritoActivo(userId, callback);
      });
    });
  });
}

function vaciarCarrito(userId, callback) {
  connection.query(
    "SELECT id_pedido FROM pedidos WHERE user_id = ? AND state = 'Carrito'",
    userId,
    (err, rows) => {
      if (err) return callback(err);
      if (!rows || rows.length === 0) {
        return callback(new Error("No hay carrito activo"));
      }

      const pedidoId = rows[0].id_pedido;

      connection.query("DELETE FROM detalles WHERE pedido_id = ?", [pedidoId], (err) => {
        if (err) return callback(err);
        connection.query("DELETE FROM pedidos WHERE id_pedido = ?", [pedidoId], (err2) => {
          if (err2) return callback(err2);
          callback(null, { message: "Carrito eliminado" });
        });
      });
    },
  );
}

function checkout(userId, callback) {
  buscarCarritoActivo(userId, (err, cart) => {
    if (err) return callback(err);
    if (!cart) {
      return callback(new Error("No hay carrito activo"));
    }
    if (cart.items.length === 0) {
      return callback(new Error("El carrito esta vacio"));
    }

    let insufficientStock = [];
    let checked = 0;

    cart.items.forEach((item) => {
      connection.query(
        "SELECT stock FROM products WHERE id_product = ?",
        item.product_id,
        (err, products) => {
          if (err) return callback(err);
          if (!products || products.length === 0 || products[0].stock < item.quantity) {
            insufficientStock.push(item.name || item.product_id);
          }
          checked++;

          if (checked === cart.items.length) {
            if (insufficientStock.length > 0) {
              return callback(
                new Error(
                  "Stock insuficiente para: " + insufficientStock.join(", "),
                ),
              );
            }

            let decremented = 0;

            cart.items.forEach((item) => {
              connection.query(
                "UPDATE products SET stock = stock - ? WHERE id_product = ? AND stock >= ?",
                [item.quantity, item.product_id, item.quantity],
                (err, result) => {
                  if (err) return callback(err);
                  if (result.affectedRows === 0) {
                    return callback(
                      new Error(
                        "Stock insuficiente para: " + (item.name || item.product_id),
                      ),
                    );
                  }
                  decremented++;

                  if (decremented === cart.items.length) {
                    connection.query(
                      "UPDATE pedidos SET state = 'Pago', fecha = NOW() WHERE id_pedido = ?",
                      [cart.pedido.id_pedido],
                      (err3) => {
                        if (err3) return callback(err3);
                        callback(null, {
                          message: "Compra realizada correctamente",
                          total: cart.pedido.total,
                        });
                      },
                    );
                  }
                },
              );
            });
          }
        },
      );
    });
  });
}

module.exports = {
  buscarCarritoActivo,
  agregarItem,
  actualizarItem,
  eliminarItem,
  vaciarCarrito,
  checkout,
};
