import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "International ScholarAI API is running" });
  });

  // Mock Scholarship API
  app.get("/api/scholarships", (req, res) => {
    const scholarships = [
      {
        id: 1,
        name: "Chevening Scholarship",
        university: "Various UK Universities",
        country: "United Kingdom",
        amount: "Fully Funded",
        deadline: "Nov 2026",
        matchScore: 98,
        difficulty: "High",
        tags: ["Government", "Master's"],
      },
      // ... more scholarships
    ];
    res.json(scholarships);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`International ScholarAI Server running on http://localhost:${PORT}`);
  });
}

startServer();
