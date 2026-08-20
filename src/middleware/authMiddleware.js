const jwt = require("jsonwebtoken");

function verificarUsuario(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({ error: "No autorizado" });
  }
  if (req.usuario.rol === "Admin") {
    console.log("Este usuario esta autorizado");
    next();
  } else {
    return res.status(401).json({ error: "No autorizado" });
  }
}

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "Token requerido",
    });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: "Token inválido",
      });
    }
    req.usuario = usuario;
    next();
  });
}

module.exports = { verificarUsuario, verificarToken };
