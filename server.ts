import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

dotenv.config();

const app = express();
const PORT = 3000;
const db = new Database("database.db");

// Database Initialization
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK(priority IN ('baixa', 'média', 'alta')) DEFAULT 'média',
    status TEXT CHECK(status IN ('pendente', 'concluída')) DEFAULT 'pendente',
    due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );
`);

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "organiza_plus_secret_key_123";

// Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
  });
};

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    const info = stmt.run(name, email, hashedPassword);
    res.status(201).json({ id: info.lastInsertRowid, name, email });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: "Email já cadastrado" });
    }
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// Task Routes
app.get("/api/tasks", authenticateToken, (req: any, res) => {
  const tasks = db.prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC").all(req.user.id);
  res.json(tasks);
});

app.post("/api/tasks", authenticateToken, (req: any, res) => {
  const { title, description, priority, due_date } = req.body;
  const stmt = db.prepare("INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)");
  const info = stmt.run(req.user.id, title, description, priority || 'média', due_date);
  const newTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(newTask);
});

app.put("/api/tasks/:id", authenticateToken, (req: any, res) => {
  const { title, description, priority, status, due_date } = req.body;
  const stmt = db.prepare(`
    UPDATE tasks 
    SET title = ?, description = ?, priority = ?, status = ?, due_date = ? 
    WHERE id = ? AND user_id = ?
  `);
  const info = stmt.run(title, description, priority, status, due_date, req.params.id, req.user.id);
  
  if (info.changes === 0) return res.status(404).json({ error: "Tarefa não encontrada" });
  res.json({ message: "Tarefa atualizada com sucesso" });
});

app.delete("/api/tasks/:id", authenticateToken, (req: any, res) => {
  const stmt = db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
  const info = stmt.run(req.params.id, req.user.id);
  
  if (info.changes === 0) return res.status(404).json({ error: "Tarefa não encontrada" });
  res.json({ message: "Tarefa excluída com sucesso" });
});

// Dashboard Stats
app.get("/api/stats", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  
  const totalTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ?").get(userId) as any;
  const completedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'concluída'").get(userId) as any;
  const pendingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'pendente'").get(userId) as any;
  
  const priorityStats = db.prepare(`
    SELECT priority, COUNT(*) as count 
    FROM tasks 
    WHERE user_id = ? 
    GROUP BY priority
  `).all(userId);

  const weeklyStats = db.prepare(`
    SELECT strftime('%Y-%W', created_at) as week, COUNT(*) as count 
    FROM tasks 
    WHERE user_id = ? AND status = 'concluída'
    GROUP BY week
    ORDER BY week DESC
    LIMIT 4
  `).all(userId);

  res.json({
    total: totalTasks.count,
    completed: completedTasks.count,
    pending: pendingTasks.count,
    priorityStats,
    weeklyStats
  });
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
