const db = require("../config/database");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

// GET
const getUsers = (req, res) => {
  db.query("SELECT id, username, created_at FROM users", (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener usuarios",
      });
    }

    res.status(200).json({
      success: true,
      message: "Usuarios obtenidos correctamente",
      data: results,
    });
  });
};

// CREATE
const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // VALIDACIONES
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username y password son obligatorios",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 4 caracteres",
      });
    }

    // HASH
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const query = "INSERT INTO users (username, password) VALUES (?, ?)";

    db.query(query, [username, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al crear usuario",
        });
      }

      res.status(201).json({
        success: true,
        message: "Usuario creado correctamente",
        data: { id: result.insertId, username },
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error inesperado",
    });
  }
};

// UPDATE
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    if (!username && !password) {
      return res.status(400).json({
        success: false,
        message: "Debe enviar al menos un campo para actualizar",
      });
    }

    let query = "UPDATE users SET ";
    let values = [];

    if (username) {
      query += "username=?, ";
      values.push(username);
    }

    if (password) {
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      query += "password=?, ";
      values.push(hashed);
    }

    query = query.slice(0, -2); // quitar coma
    query += " WHERE id=?";
    values.push(id);

    db.query(query, values, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al actualizar usuario",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Usuario actualizado correctamente",
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error inesperado",
    });
  }
};

const deleteUser = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM users WHERE id=?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al eliminar usuario",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  });
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
