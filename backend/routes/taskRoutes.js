const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all projects for the authenticated user
router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.userId },
      include: {
        tasks: true,
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new project
router.post('/projects', async (req, res) => {
  try {
    const { name } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        userId: req.user.userId
      },
      include: {
        tasks: true,
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a project
router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Check if project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: { id: parseInt(id), userId: req.user.userId }
    });
    
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { name },
      include: {
        tasks: true,
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });
    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a project
router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: { id: parseInt(id), userId: req.user.userId }
    });
    
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete all tasks in the project first
    await prisma.task.deleteMany({
      where: { projectId: parseInt(id) }
    });

    // Delete the project
    await prisma.project.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all tasks for a specific project
router.get('/projects/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const { filter } = req.query; // all, active, completed
    
    // Check if project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: parseInt(id), userId: req.user.userId }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    let whereClause = { projectId: parseInt(id) };
    
    if (filter === 'active') {
      whereClause.completed = false;
    } else if (filter === 'completed') {
      whereClause.completed = true;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new task
router.post('/projects/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    // Check if project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: parseInt(id), userId: req.user.userId }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        projectId: parseInt(id)
      }
    });
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a task
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    
    // Check if task belongs to user's project
    const existingTask = await prisma.task.findFirst({
      where: { 
        id: parseInt(id),
        project: {
          userId: req.user.userId
        }
      }
    });
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) updateData.completed = completed;

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a task
router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if task belongs to user's project
    const existingTask = await prisma.task.findFirst({
      where: { 
        id: parseInt(id),
        project: {
          userId: req.user.userId
        }
      }
    });
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [totalProjects, totalTasks, completedTasks, activeTasks] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.task.count({ 
        where: { 
          project: { userId } 
        } 
      }),
      prisma.task.count({ 
        where: { 
          project: { userId },
          completed: true 
        } 
      }),
      prisma.task.count({ 
        where: { 
          project: { userId },
          completed: false 
        } 
      })
    ]);

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      activeTasks
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;