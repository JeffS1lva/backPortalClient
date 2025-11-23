const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const userRoutes = require("./src/routes/userRoutes");

const app = express();

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://portal-nexion.vercel.app",
      "https://www.portal-nexion.vercel.app",
      "https://portal-nexion.fly.dev",
    ];

    if (allowedOrigins.some(allowed => 
      origin === allowed || origin === allowed + "/" || origin + "/" === allowed
    )) {
      callback(null, true);
    } else {
      console.log("CORS bloqueado para origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
}));

app.use(express.json());

// CORREÇÃO PRINCIPAL: ssl: false FORÇADO para Postgres self-hosted no Fly.io
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false   // ← ESSA LINHA RESOLVE TODOS OS PROBLEMAS NO FLY
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err.stack);
});

async function connectWithRetry() {
  for (let i = 0; i < 10; i++) {
    try {
      const client = await pool.connect();
      console.log('Banco conectado com sucesso!');
      client.release();
      return;
    } catch (err) {
      console.log(`Tentativa ${i + 1}/10 de conectar ao banco...`);
      if (i === 9) {
        console.error('Falha ao conectar ao banco após várias tentativas:', err.message);
      } else {
        await new Promise(res => setTimeout(res, 5000));
      }
    }
  }
}

app.use("/users", userRoutes(pool));

// Health check
app.get("/health", async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: "OK", 
      message: "Backend + PostgreSQL conectados (Fly.io gru)", 
      time: new Date().toISOString() 
    });
  } catch (err) {
    res.status(500).json({ 
      status: "ERROR", 
      message: "Falha na conexão com o banco", 
      error: err.message 
    });
  }
});

// Rota raiz (opcional)
app.get("/", (req, res) => {
  res.json({ message: "Backend Nexion rodando no Fly.io" });
});

// Start do servidor
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
  console.log(`Health → https://portal-nexion.fly.dev/health`);
  console.log(`Users  → https://portal-nexion.fly.dev/users`);
});

// Inicia tentativa de conexão
connectWithRetry();