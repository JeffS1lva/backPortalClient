const express = require("express");
const jwt = require("jsonwebtoken");
const {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  loginUser,
} = require("../controllers/userController");

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-2025-nexion";

// Middleware de autenticação
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
};

module.exports = (pool) => {
  const router = express.Router();

  // Injeta pool em todos os handlers
  const withPool = (handler) => (req, res) => handler(req, res, pool);

  // Rotas públicas
  router.get("/", withPool(getUsers));
  router.post("/", withPool(createUser));
  router.post("/login", withPool(loginUser));

  // Rotas protegidas
  router.get("/me", authenticate, withPool(async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT id, name, email, created_at FROM users WHERE id = $1",
        [req.user.id]
      );
      if (!result.rows[0]) return res.status(404).json({ error: "Usuário não encontrado" });
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Erro em /me:", error);
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  }));

  router.put("/:id", authenticate, withPool(async (req, res) => {
    if (parseInt(req.params.id) !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado: você só pode editar seu próprio perfil" });
    }
    return updateUser(req, res, pool);
  }));

  router.delete("/:id", authenticate, withPool(async (req, res) => {
    if (parseInt(req.params.id) !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado: você só pode deletar seu próprio perfil" });
    }
    return deleteUser(req, res, pool);
  }));

  return router;
};