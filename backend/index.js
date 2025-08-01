const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// 🧪 Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// 👤 Create a user
app.post("/users", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.create({
      data: { email, password },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📁 Create a project under a user
app.post("/projects", async (req, res) => {
  const { name, userId } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name,
        user: { connect: { id: userId } },
      },
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create a task under a project
app.post("/tasks", async (req, res) => {
  const { title, projectId } = req.body;
  try {
    const task = await prisma.task.create({
      data: {
        title,
        project: { connect: { id: projectId } },
      },
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📃 Get all tasks by project
app.get("/projects/:id/tasks", async (req, res) => {
  const projectId = parseInt(req.params.id);
  const tasks = await prisma.task.findMany({
    where: { projectId },
  });
  res.json(tasks);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
