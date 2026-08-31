const service = require("../services/productService");

const getProducts = (req, res) => {
  service.obtenerProductos((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener productos",
      });
    }

    res.status(200).json({
      success: true,
      message: "Productos obtenidos correctamente",
      data: results,
    });
  });
};

const createProduct = (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    if (
      !name ||
      !description ||
      !price ||
      stock === undefined ||
      stock === null
    ) {
      return res.status(400).json({
        success: false,
        message: "name, description, price y stock son obligatorios",
      });
    }

    service.crearProducto({ name, description, price, stock }, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al crear producto",
        });
      }

      res.status(200).json({
        success: true,
        message: "Producto creado correctamente",
        data: results,
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear producto",
    });
  }
};

const updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id es obligatorio",
      });
    }

    if (!name && !description && !price) {
      return res.status(400).json({
        success: false,
        message: "name, description y price son obligatorios",
      });
    }

    service.actualizarProducto(
      id,
      { name, description, price },
      (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error al actualizar producto",
          });
        }

        res.status(200).json({
          success: true,
          message: "Producto actualizado correctamente",
          data: results,
        });
      },
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar producto",
    });
  }
};

const deleteProduct = (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id es obligatorio",
      });
    }

    service.eliminarProducto(id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al eliminar producto",
        });
      }
      if (!results || results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }
      res.status(200).json({
        success: true,
        message: "Producto eliminado correctamente",
        data: results,
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar producto",
    });
  }
};

const searchProductByName = (req, res) => {
  const { name } = req.body;

  service.buscarProductoPorNombre(name, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al buscar producto",
      });
    }

    res.status(200).json({
      success: true,
      message: "Producto encontrado",
      data: results,
    });
  });
};

const searchProductById = (req, res) => {
  const { id } = req.body;

  service.buscarProductoPorId(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al buscar producto",
      });
    }

    res.status(200).json({
      success: true,
      message: "Producto encontrado",
      data: results,
    });
  });
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProductByName,
  searchProductById,
};
