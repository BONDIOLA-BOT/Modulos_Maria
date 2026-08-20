const service = require("../services/carritotService");

function getCart(req, res) {
  service.buscarCarritoActivo(req.usuario.id, (err, cart) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener carrito",
      });
    }
    res.status(200).json({ success: true, data: cart });
  });
}

function addItem(req, res) {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "product_id y quantity (entero positivo) son obligatorios",
      });
    }

    service.agregarItem(req.usuario.id, product_id, quantity, (err, cart) => {
      if (err) {
        if (err.message === "Stock insuficiente") {
          return res.status(409).json({ success: false, message: err.message });
        }
        if (err.message === "Producto no encontrado") {
          return res.status(404).json({ success: false, message: err.message });
        }
        return res.status(500).json({
          success: false,
          message: "Error al agregar item",
        });
      }
      res.status(200).json({
        success: true,
        message: "Item agregado correctamente",
        data: cart,
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al agregar item" });
  }
}

function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "quantity debe ser un entero positivo",
      });
    }

    service.actualizarItem(Number(id), req.usuario.id, quantity, (err, cart) => {
      if (err) {
        if (err.message === "Item no encontrado en tu carrito") {
          return res.status(404).json({ success: false, message: err.message });
        }
        if (err.message === "Stock insuficiente") {
          return res.status(409).json({ success: false, message: err.message });
        }
        return res.status(500).json({
          success: false,
          message: "Error al actualizar item",
        });
      }
      res.status(200).json({
        success: true,
        message: "Item actualizado correctamente",
        data: cart,
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar item",
    });
  }
}

function removeItem(req, res) {
  try {
    const { id } = req.params;

    service.eliminarItem(Number(id), req.usuario.id, (err, cart) => {
      if (err) {
        if (err.message === "Item no encontrado en tu carrito") {
          return res.status(404).json({ success: false, message: err.message });
        }
        return res.status(500).json({
          success: false,
          message: "Error al eliminar item",
        });
      }
      res.status(200).json({
        success: true,
        message: "Item eliminado correctamente",
        data: cart,
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar item",
    });
  }
}

function clearCart(req, res) {
  service.vaciarCarrito(req.usuario.id, (err, result) => {
    if (err) {
      if (err.message === "No hay carrito activo") {
        return res.status(404).json({ success: false, message: err.message });
      }
      return res.status(500).json({
        success: false,
        message: "Error al vaciar carrito",
      });
    }
    res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}

function checkout(req, res) {
  service.checkout(req.usuario.id, (err, result) => {
    if (err) {
      if (err.message === "No hay carrito activo" || err.message === "El carrito esta vacio") {
        return res.status(400).json({ success: false, message: err.message });
      }
      if (err.message.startsWith("Stock insuficiente para:")) {
        return res.status(409).json({ success: false, message: err.message });
      }
      return res.status(500).json({
        success: false,
        message: "Error al procesar compra",
      });
    }
    res.status(200).json({
      success: true,
      message: result.message,
      data: { total: result.total },
    });
  });
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  checkout,
};
