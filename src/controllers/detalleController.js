const service = require("../services/detalleService");

function getDetalles(req, res) {
  const userId = req.usuario.rol === "Admin" ? null : req.usuario.id;
  service.obtenerDetalles(userId, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener Detalles",
      });
    }

    res.status(200).json({
      success: true,
      message: "Detalles obtenidos correctamente",
      data: results,
    });
  });
}

function createDetalle(req, res) {
  try {
    const { product_id, pedido_id, quantity } = req.body;

    if (!product_id || !pedido_id) {
      return res.status(400).json({
        success: false,
        message: "product_id y pedido_id son obligatorios",
      });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "quantity debe ser un entero positivo",
      });
    }

    const userId = req.usuario.rol === "Admin" ? null : req.usuario.id;
    const crear = () =>
      service.crearDetalle(
        { product_id, pedido_id, quantity },
        (err, results) => {
          if (err)
            return res
              .status(500)
              .json({ success: false, message: "Error al crear detalle" });
          res.status(200).json({
            success: true,
            message: "Detalle creado correctamente",
            data: results,
          });
        },
      );

    if (!userId) return crear();

    service.pedidoPerteneceAUsuario(pedido_id, userId, (err, rows) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Error al crear detalle" });
      if (!rows || rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "El pedido no existe o no te pertenece",
        });
      }
      crear();
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear detalle" });
  }
}

function updateDetalle(req, res) {
  try {
    const { id } = req.params;
    const { product_id, pedido_id, quantity } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id es obligatorio",
      });
    }

    if (!quantity && !product_id)
      return res.status(400).json({
        success: false,
        message: "product_id o quantity son obligatorios",
      });
    if (
      quantity !== undefined &&
      (!Number.isInteger(quantity) || quantity <= 0)
    )
      return res.status(400).json({
        success: false,
        message: "quantity debe ser un entero positivo",
      });

    const userId = req.usuario.rol === "Admin" ? null : req.usuario.id;

    service.actualizarDetalle(
      { product_id, pedido_id, quantity },
      id,
      userId,
      (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error al actualizar detalle",
          });
        }

        res.status(200).json({
          success: true,
          message: "Detalle actualizado correctamente",
          data: results,
        });
      },
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar detalle",
    });
  }
}

function deleteDetalle(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id es obligatorio",
      });
    }

    const userId = req.usuario.rol === "Admin" ? null : req.usuario.id;

    service.eliminarDetalle(id, userId, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al eliminar detalle",
        });
      }
      if (!results || results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Detalle no encontrado",
        });
      }
      res.status(200).json({
        success: true,
        message: "Detalle eliminado correctamente",
        data: results,
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar detalle",
    });
  }
}

function searchDetalleByPedido(req, res) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id es obligatorio",
      });
    }

    const userId = req.usuario.rol === "Admin" ? null : req.usuario.id;

    service.buscarDetallePorPedido(id, userId, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al buscar detalle",
        });
      }
      if (!results || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Detalle no encontrado",
        });
      }
      res.status(200).json({
        success: true,
        message: "Detalle encontrado correctamente",
        data: results,
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al buscar detalle",
    });
  }
}

function searchDetalleById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id es obligatorio",
      });
    }
    const userId = req.usuario.rol === "Admin" ? null : req.usuario.id;

    service.buscarDetallePorId(id, userId, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al buscar detalle",
        });
      }
      if (!results || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Detalle no encontrado",
        });
      }
      res.status(200).json({
        success: true,
        message: "Detalle encontrado correctamente",
        data: results,
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al buscar detalle",
    });
  }
}

module.exports = {
  getDetalles,
  createDetalle,
  updateDetalle,
  deleteDetalle,
  searchDetalleByPedido,
  searchDetalleById,
};
