const express = require("express");
const helmet = require("helmet");
const app = express();

// LOGS INICIAIS
console.log("[BOOT] Iniciando ClickSeguro demo...");

const PORT = Number(process.env.PORT) || 8080;

// middlewares básicos
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// home
app.get("/", (_req, res) => {
  res.send(`
    <h1>ClickSeguro</h1>
    <p>OK! App no ar.</p>
    <p>Tente /hello?name=Victor</p>
  `);
});

// VULNERABILIDADE proposital (XSS)
app.get("/hello", (req, res) => {
  const name = req.query.name || "visitante";
  res.send(`<h2>Olá, ${name}!</h2>`);
});

// START SERVER + handlers
const server = app.listen(PORT, () => {
  console.log(`[READY] App ouvindo em http://localhost:${PORT}`);
});

server.on("error", (err) => {
  console.error("[ERROR] Falha ao subir servidor:", err);
});
