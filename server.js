require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const userRoutes = require("./src/routes/userRoutes");

const app = express();

// CORS
app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: mobile, curl, Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://portal-nexion.vercel.app",
      "https://www.portal-nexion.vercel.app", // por segurança
      "https://portal-nexion.fly.dev",        // se acessar direto
    ];

    // Verifica se a origin está na lista (exata ou com/vem barra)
    if (allowedOrigins.some(allowed => 
      origin === allowed || origin === allowed + "/" || origin + "/" === allowed
    )) {
      callback(null, true);
    } else {
      console.log("CORS bloqueado para origin:", origin); // ← isso ajuda MUITO a debugar
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Teste conexão
pool.connect((err) => {
  if (err) {
    console.error("Erro no banco:", err.stack);
    process.exit(1);
  } else {
    console.log("Banco conectado");
  }
});

app.use("/users", userRoutes(pool));

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor na porta ${PORT}`);
});