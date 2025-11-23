// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

// IMPORTANTE: caminho correto!
const userRoutesFactory = require("./src/routes/userRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://portal-nexion.vercel.app",
      "https://portal-nexion.fly.dev",
    ],
    credentials: true,
  })
);

// Conexão com o banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// REGISTRA A ROTA CORRETAMENTE
app.use("/api/users", userRoutesFactory(pool)); // ← PASSA O POOL AQUI!!

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ANTES (funciona local, mas NÃO no Fly.io)
// → MUDE PARA ISSO (OBRIGATÓRIO NO FLY.IO):
const PORT = process.env.PORT || 8080; // Fly usa 8080 internamente
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend rodando na porta ${PORT}`);
});