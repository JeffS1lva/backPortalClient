// src/routes/userRoutes.js
const express = require("express");
const {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  loginUser,
} = require("../controllers/userController");

module.exports = (pool) => {
  const router = express.Router();

  // Middleware para injetar `pool` em todos os handlers
  const withPool = (handler) => (req, res) => handler(req, res, pool);

  // Rotas com pool injetado
  router.get("/", withPool(getUsers));
  router.post("/", withPool(createUser));
  router.post("/login", withPool(loginUser));
  router.put("/:id", withPool(updateUser));
  router.delete("/:id", withPool(deleteUser));

  return router;
};