const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const STORE_PATH = path.join(__dirname, "data", "store.json");
const STAGES = ["Idea", "Screening", "Prototype", "Implementation"];
const CATEGORIES = ["Product", "Process", "Marketing", "Social"];

const adminCredentials = {
  email: process.env.ADMIN_EMAIL || "admin@ims.com",
  password: process.env.ADMIN_PASSWORD || "admin123"
};

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

let writeQueue = Promise.resolve();

async function readStore() {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      ideas: Array.isArray(parsed.ideas) ? parsed.ideas : [],
      lastBackup: parsed.lastBackup || null
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      const initial = { users: [], ideas: [], lastBackup: null };
      await writeStore(initial);
      return initial;
    }
    throw error;
  }
}

async function writeStore(store) {
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  });
  return writeQueue;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

function validateIdeaPayload(body) {
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const category = String(body.category || "");
  const impact = Number(body.impact);
  const feasibility = Number(body.feasibility);
  const rating = Number(body.rating);
  const stage = String(body.stage || "Idea");

  if (!title || !description) {
    return { ok: false, message: "Title and description are required." };
  }
  if (!CATEGORIES.includes(category)) {
    return { ok: false, message: "Invalid category." };
  }
  if (![impact, feasibility, rating].every((v) => Number.isInteger(v) && v >= 1 && v <= 5)) {
    return { ok: false, message: "Impact, feasibility, and rating must be between 1 and 5." };
  }
  if (!STAGES.includes(stage)) {
    return { ok: false, message: "Invalid stage." };
  }

  return {
    ok: true,
    value: { title, description, category, impact, feasibility, rating, stage }
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ims-api" });
});

app.post("/api/auth/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (name.length < 2) {
    return res.status(400).json({ message: "Name must be at least 2 characters." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }
  if (email === "admin@ims.com") {
    return res.status(400).json({ message: "This email is reserved." });
  }

  const store = await readStore();
  const exists = store.users.some((u) => u.email.toLowerCase() === email);
  if (exists) {
    return res.status(409).json({ message: "This email is already registered." });
  }

  const newUser = {
    id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    email,
    password,
    createdAt: new Date().toISOString()
  };

  store.users.push(newUser);
  await writeStore(store);

  return res.status(201).json({ user: sanitizeUser(newUser) });
});

app.get("/api/users/exists", async (req, res) => {
  const email = String(req.query.email || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ message: "Email query is required." });
  }

  const store = await readStore();
  const exists = email === adminCredentials.email.toLowerCase() || store.users.some((u) => u.email.toLowerCase() === email);
  return res.json({ exists });
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const store = await readStore();
  const user = store.users.find((u) => u.email.toLowerCase() === email);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      loginTime: new Date().toISOString()
    }
  });
});

app.post("/api/auth/admin/login", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (email !== adminCredentials.email.toLowerCase() || password !== adminCredentials.password) {
    return res.status(401).json({ message: "Invalid admin credentials." });
  }

  return res.json({
    admin: {
      id: "admin-001",
      name: "System Administrator",
      email: adminCredentials.email,
      role: "admin",
      loginTime: new Date().toISOString()
    }
  });
});

app.get("/api/users", async (_req, res) => {
  const store = await readStore();
  res.json({ users: store.users.map(sanitizeUser) });
});

app.delete("/api/users/:id", async (req, res) => {
  const userId = String(req.params.id || "");
  const store = await readStore();

  const beforeCount = store.users.length;
  store.users = store.users.filter((u) => u.id !== userId);
  const removed = beforeCount - store.users.length;

  if (!removed) {
    return res.status(404).json({ message: "User not found." });
  }

  store.ideas = store.ideas.filter((idea) => idea.createdBy?.id !== userId);
  await writeStore(store);

  return res.json({ success: true });
});

app.delete("/api/users", async (_req, res) => {
  const store = await readStore();
  store.users = [];
  store.ideas = [];
  await writeStore(store);
  res.json({ success: true });
});

app.get("/api/ideas", async (_req, res) => {
  const store = await readStore();
  res.json({ ideas: store.ideas });
});

app.post("/api/ideas/sync", async (req, res) => {
  const incomingIdeas = Array.isArray(req.body.ideas) ? req.body.ideas : null;
  if (!incomingIdeas) {
    return res.status(400).json({ message: "ideas array is required." });
  }

  const store = await readStore();
  store.ideas = incomingIdeas;
  await writeStore(store);
  return res.json({ success: true });
});

app.post("/api/ideas", async (req, res) => {
  const validation = validateIdeaPayload(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: validation.message });
  }

  const createdBy = req.body.createdBy && typeof req.body.createdBy === "object" ? req.body.createdBy : null;
  if (!createdBy || !createdBy.id || !createdBy.name || !createdBy.email) {
    return res.status(400).json({ message: "createdBy is required." });
  }

  const store = await readStore();
  const now = new Date().toISOString();
  const newIdea = {
    id: `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...validation.value,
    votes: 0,
    comments: [],
    createdBy,
    createdAt: now
  };

  store.ideas.unshift(newIdea);
  await writeStore(store);
  res.status(201).json({ idea: newIdea });
});

app.put("/api/ideas/:id", async (req, res) => {
  const ideaId = String(req.params.id || "");
  const validation = validateIdeaPayload(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: validation.message });
  }

  const store = await readStore();
  const idea = store.ideas.find((item) => item.id === ideaId);
  if (!idea) {
    return res.status(404).json({ message: "Idea not found." });
  }

  Object.assign(idea, validation.value);
  await writeStore(store);
  res.json({ idea });
});

app.delete("/api/ideas/:id", async (req, res) => {
  const ideaId = String(req.params.id || "");
  const store = await readStore();
  const beforeCount = store.ideas.length;
  store.ideas = store.ideas.filter((item) => item.id !== ideaId);

  if (beforeCount === store.ideas.length) {
    return res.status(404).json({ message: "Idea not found." });
  }

  await writeStore(store);
  res.json({ success: true });
});

app.post("/api/ideas/:id/vote", async (req, res) => {
  const ideaId = String(req.params.id || "");
  const delta = Number(req.body.delta || 0);
  if (![1, -1].includes(delta)) {
    return res.status(400).json({ message: "delta must be 1 or -1." });
  }

  const store = await readStore();
  const idea = store.ideas.find((item) => item.id === ideaId);
  if (!idea) {
    return res.status(404).json({ message: "Idea not found." });
  }

  idea.votes = Math.max(0, Number(idea.votes || 0) + delta);
  await writeStore(store);
  res.json({ idea });
});

app.post("/api/ideas/:id/comments", async (req, res) => {
  const ideaId = String(req.params.id || "");
  const text = String(req.body.text || "").trim();
  if (!text) {
    return res.status(400).json({ message: "Comment text is required." });
  }

  const store = await readStore();
  const idea = store.ideas.find((item) => item.id === ideaId);
  if (!idea) {
    return res.status(404).json({ message: "Idea not found." });
  }

  if (!Array.isArray(idea.comments)) {
    idea.comments = [];
  }
  idea.comments.push(text);
  await writeStore(store);
  res.json({ idea });
});

app.get("/api/admin/overview", async (_req, res) => {
  const store = await readStore();
  const totalVotes = store.ideas.reduce((sum, idea) => sum + Number(idea.votes || 0), 0);
  const totalComments = store.ideas.reduce((sum, idea) => sum + (Array.isArray(idea.comments) ? idea.comments.length : 0), 0);

  res.json({
    users: store.users.map(sanitizeUser),
    ideas: store.ideas,
    stats: {
      totalUsers: store.users.length,
      totalIdeas: store.ideas.length,
      totalVotes,
      totalComments
    },
    lastBackup: store.lastBackup
  });
});

app.post("/api/admin/backup", async (_req, res) => {
  const store = await readStore();
  store.lastBackup = new Date().toISOString();
  await writeStore(store);
  res.json({ success: true, lastBackup: store.lastBackup });
});

app.post("/api/system/reset", async (_req, res) => {
  const defaultStore = {
    users: [
      {
        id: "demo-user",
        name: "Demo User",
        email: "demo@ims.com",
        password: "demo123",
        createdAt: "2026-03-01T09:00:00.000Z"
      }
    ],
    ideas: [
      {
        id: "id-1001",
        title: "Smart Inventory Alerts",
        description: "Use sensors and auto-reorder triggers to avoid stockouts.",
        category: "Process",
        impact: 5,
        feasibility: 4,
        rating: 5,
        stage: "Screening",
        votes: 12,
        comments: ["Great for supply chain visibility."],
        createdBy: { id: "demo-user", name: "Demo User", email: "demo@ims.com" },
        createdAt: "2026-03-01T10:00:00.000Z"
      },
      {
        id: "id-1002",
        title: "Eco-Friendly Packaging",
        description: "Replace plastic wrap with compostable materials.",
        category: "Product",
        impact: 4,
        feasibility: 4,
        rating: 4,
        stage: "Prototype",
        votes: 8,
        comments: ["Aligns with sustainability goals."],
        createdBy: { id: "demo-user", name: "Demo User", email: "demo@ims.com" },
        createdAt: "2026-03-02T14:30:00.000Z"
      },
      {
        id: "id-1003",
        title: "Campus Ambassador Program",
        description: "Let students promote products via referral rewards.",
        category: "Marketing",
        impact: 3,
        feasibility: 5,
        rating: 3,
        stage: "Idea",
        votes: 5,
        comments: ["Could boost brand reach quickly."],
        createdBy: { id: "demo-user", name: "Demo User", email: "demo@ims.com" },
        createdAt: "2026-03-03T09:15:00.000Z"
      },
      {
        id: "id-1004",
        title: "Community Skill Workshops",
        description: "Offer weekend workshops to build local talent.",
        category: "Social",
        impact: 4,
        feasibility: 3,
        rating: 4,
        stage: "Implementation",
        votes: 9,
        comments: [],
        createdBy: { id: "demo-user", name: "Demo User", email: "demo@ims.com" },
        createdAt: "2026-03-04T16:45:00.000Z"
      },
      {
        id: "id-1005",
        title: "AI Support Chat",
        description: "Provide 24/7 answers with an AI support assistant.",
        category: "Process",
        impact: 5,
        feasibility: 3,
        rating: 5,
        stage: "Screening",
        votes: 15,
        comments: ["Ensure human handoff available."],
        createdBy: { id: "demo-user", name: "Demo User", email: "demo@ims.com" },
        createdAt: "2026-03-05T11:20:00.000Z"
      }
    ],
    lastBackup: null
  };

  await writeStore(defaultStore);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`IMS server running at http://localhost:${PORT}`);
});
