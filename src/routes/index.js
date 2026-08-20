const express = require("express");
const router = express.Router();

const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  searchUserById,
  searchUserByName,
} = require("../controllers/userController");
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProductById,
  searchProductByName,
} = require("../controllers/productController.js");

const { login, logout, isAuth } = require("../controllers/login");

const {
  verificarUsuario,
  verificarToken,
} = require("../middleware/authMiddleware");
const {
  getPedidos,
  createPedido,
  updatePedido,
  deletePedido,
  searchPedidoById,
  searchPedidoByUser,
} = require("../controllers/pedidoController.js");
const {
  getDetalles,
  createDetalle,
  updateDetalle,
  deleteDetalle,
  searchDetalleById,
  searchDetalleByPedido,
} = require("../controllers/detalleController.js");
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  checkout,
} = require("../controllers/carritoController.js");

//Rutas de usuario
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", verificarToken, verificarUsuario, updateUser);
router.delete("/users/:id", verificarToken, verificarUsuario, deleteUser);
router.post("/users/searchByName", verificarToken, searchUserByName);
router.post("/users/searchById", verificarToken, searchUserById);
// Rutas de autenticacion
router.post("/login", login);
router.post("/logout", isAuth, logout);
router.get("/isAuth", isAuth);

// Rutas de producto con authenticacion
router.get("/products", getProducts);
router.post("/products", verificarToken, verificarUsuario, createProduct);
router.put("/products/:id", verificarToken, verificarUsuario, updateProduct);
router.delete("/products/:id", verificarToken, verificarUsuario, deleteProduct);
router.post("/products/searchByName", verificarToken, searchProductByName);
router.post("/products/searchById", verificarToken, searchProductById);

// Rutas de pedidos
router.get("/pedidos", verificarToken, getPedidos);
router.post("/pedidos", verificarToken, createPedido);
router.put("/pedidos/:id", verificarToken, updatePedido);
router.delete("/pedidos/:id", verificarToken, deletePedido);
router.post("/pedidos/searchById/:id", verificarToken, searchPedidoById);
router.post("/pedidos/searchByUser", verificarToken, searchPedidoByUser);
// Rutas de detalles
router.get("/detalles", verificarToken, getDetalles);
router.post("/detalles", verificarToken, createDetalle);
router.put("/detalles/:id", verificarToken, updateDetalle);
router.delete("/detalles/:id", verificarToken, deleteDetalle);
router.post("/detalles/searchById/:id", verificarToken, searchDetalleById);
router.post("/detalles/searchByPedido", verificarToken, searchDetalleByPedido);
// Rutas de carrito como tal
router.get("/carrito", verificarToken, getCart);
router.post("/carrito/items", verificarToken, addItem);
router.put("/carrito/items/:id", verificarToken, updateItem);
router.delete("/carrito/items/:id", verificarToken, removeItem);
router.delete("/carrito", verificarToken, clearCart);
router.post("/carrito/checkout", verificarToken, checkout);

module.exports = router;
