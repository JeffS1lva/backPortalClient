require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const userRoutes = require("./src/routes/userRoutes");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://portal-nexion.vercel.app/", // Adicione seu frontend em produção
      ];
      if (!origin || allowed.includes(origin)) {
        callback(null, origin || true);
      } else {
        callback(new Error("CORS não permitido"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// CONEXÃO COM RAILWAY POSTGRES (DATABASE_URL + SSL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necessário para Railway
  },
});

app.use("/users", userRoutes(pool));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});