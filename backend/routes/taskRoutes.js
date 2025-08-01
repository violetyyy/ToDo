const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all task routes
router.use(authenticateToken);

// Get all projects for authenticated user
router.get("/projects", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.userId },
      include: {
        tasks: true,
        _count: { select: { tasks: true } },
      },
    });
    res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new project
router.post("/projects", async (req, res) => {
  try {
    const { name } = req.body;
    const project = await prisma.project.create({
      data: { name, userId: req.user.userId },
      include: {
        tasks: true,
        _count: { select: { tasks: true } },
      },
    });
    res.status(201).json(project);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a project
router.put("/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name } = req.body;

    const existingProject = await prisma.project.findFirst({
      where: { id, userId: req.user.userId },
    });
    if (!existingProject)
      return res.status(404).json({ error: "Project not found" });

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { name },
      include: {
        tasks: true,
        _count: { select: { tasks: true } },
      },
    });
    res.json(updatedProject);
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a project and its tasks
router.delete("/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existingProject = await prisma.project.findFirst({
      where: { id, userId: req.user.userId },
    });
    if (!existingProject)
      return res.status(404).json({ error: "Project not found" });

    await prisma.task.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get tasks for a project with optional filter
router.get("/projects/:id/tasks", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const filter = req.query.filter;

    const project = await prisma.project.findFirst({
      where: { id, userId: req.user.userId },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const whereClause = { projectId: id };
    if (filter === "active") whereClause.completed = false;
    else if (filter === "completed") whereClause.completed = true;

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new task under a project
router.post("/projects/:id/tasks", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title } = req.body;

    const project = await prisma.project.findFirst({
      where: { id, userId: req.user.userId },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const task = await prisma.task.create({
      data: { title, projectId: id },
    });
    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a task by id
router.put("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, completed } = req.body;

    const existingTask = await prisma.task.findFirst({
      where: { id, project: { userId: req.user.userId } },
    });
    if (!existingTask) return res.status(404).json({ error: "Task not found" });

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) updateData.completed = completed;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });
    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a task by id
router.delete("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existingTask = await prisma.task.findFirst({
      where: { id, project: { userId: req.user.userId } },
    });
    if (!existingTask) return res.status(404).json({ error: "Task not found" });

    await prisma.task.delete({ where: { id } });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Dashboard stats for user
router.get("/dashboard/stats", async (req, res) => {
  try {
    const userId = req.user.userId;

    const [totalProjects, totalTasks, completedTasks, activeTasks] =
      await Promise.all([
        prisma.project.count({ where: { userId } }),
        prisma.task.count({ where: { project: { userId } } }),
        prisma.task.count({ where: { project: { userId }, completed: true } }),
        prisma.task.count({ where: { project: { userId }, completed: false } }),
      ]);

    res.json({ totalProjects, totalTasks, completedTasks, activeTasks });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
