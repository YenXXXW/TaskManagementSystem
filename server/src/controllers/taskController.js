const Task = require('../models/task');
const User = require('../models/user');
const Notification = require('../models/notificaton')
const { getIO } = require('../../config/socket')

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    const tasksWithOverdue = tasks.map(task => {
      const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
      return {
        ...task.toObject(),
        isOverdue
      };
    });
    res.json(tasksWithOverdue);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

// Get a single task by ID
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the task
    const hasAccess = task.createdBy.equals(req.user._id) ||
      task.assignedTo?.equals(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Error fetching task' });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, status, description, dueDate, priority, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({
        message: 'Missing required field: title',
      });
    }


    let task = new Task({
      title,
      description,
      dueDate: new Date(dueDate).toISOString() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: priority || 'medium',
      status: status || 'pending',
      createdBy: req.user._id,
    });


    let assignedUser = null;
    if (assignedTo && assignedTo.trim() !== '') {
      assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({ message: 'Assigned user not found' });
      }
      task.assignedTo = assignedTo;
    }


    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', '_id name email');


    if (assignedUser) {
      const notification = new Notification({
        user: assignedUser._id,
        type: 'taskAssigned',
        message: `${req.user.name} assigned you a new task.`,
        task: task._id,
        createdBy: req.user._id,
      });
      await notification.save();

      const populatedNotification = await Notification.findById(notification._id)
        .populate('createdBy')
        .populate({
          path: 'task',
          populate: [
            { path: 'createdBy' },
            { path: 'assignedTo' },
          ]
        });

      const io = getIO();
      io.to(assignedUser._id.toString()).emit('taskAssigned', populatedNotification);
    }

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;


    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to update the task
    const hasPermission = task.createdBy.equals(req.user._id) ||
      task.assignedTo?.equals(req.user._id);

    if (!hasPermission) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Update fields if provided
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({ message: 'Assigned user not found' });
      }
      task.assignedTo = assignedTo;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');


    const assigneeId = updatedTask.assignedTo?._id?.toString();
    const taskCreatorId = updatedTask.createdBy?._id?.toString();

    console.log("assigneeId", assigneeId)
    console.log("taskCreatorId", taskCreatorId)

    const notifyUserId = req.user._id.toString() === assigneeId ? taskCreatorId : assigneeId


    if (notifyUserId) {
      const notification = new Notification({
        user: notifyUserId,
        type: 'taskUpdated',
        message: `${req.user.name} updated task.`,
        task: task._id,
        createdBy: req.user._id
      });
      await notification.save();

      const populatedNotification = await Notification.findById(notification._id)
        .populate('createdBy')
        .populate({
          path: 'task',
          populate: [
            { path: 'createdBy' },
            { path: 'assignedTo' },
          ]
        });

      const io = getIO()
      io.to(notifyUserId).emit('taskUpdated', populatedNotification);
    }

    res.status(200).json(updatedTask);

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

// Get tasks by status
exports.getTasksByStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const tasks = await Task.find({
      $or: [
        { createdBy: userId },
        { assignedTo: userId }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    const grouped = {
      pending: [],
      inProgress: [],
      completed: [],
    };

    tasks.forEach(task => {
      if (task.status === 'pending') {
        grouped.pending.push(task);
      } else if (task.status === 'in-progress') {
        grouped.inProgress.push(task);
      } else if (task.status === 'completed') {
        grouped.completed.push(task);
      }
    });


    res.json(grouped);
  } catch (error) {
    console.error('Error grouping tasks by status:', error);
    res.status(500).json({ message: 'Error grouping tasks by status' });
  }
};

// Get tasks by priority
exports.getTasksByPriority = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    const groupedTasks = {
      low: [],
      medium: [],
      high: []
    };

    tasks.forEach(task => {
      if (groupedTasks[task.priority]) {
        groupedTasks[task.priority].push(task);
      }
    });

    res.json(groupedTasks);
  } catch (error) {
    console.error('Error fetching tasks by priority:', error);
    res.status(500).json({ message: 'Error fetching tasks by priority' });
  }
};


// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No task IDs provided' });
    }

    const tasks = await Task.find({ _id: { $in: ids } }).populate('createdBy', 'name');

    if (tasks.length !== ids.length) {
      return res.status(404).json({ message: 'One or more tasks not found' });
    }

    // check if all the tasks are created by user 
    const unauthorizedTasks = tasks.filter(task => !task.createdBy._id.equals(req.user._id));
    if (unauthorizedTasks.length > 0) {
      return res.status(403).json({ message: 'You are not authorized to delete one or more tasks' });
    }

    const userTaskMap = {};
    for (const task of tasks) {
      if (task.assignedTo && !task.assignedTo._id.equals(req.user._id)) {
        const userId = task.assignedTo._id.toString();
        if (!userTaskMap[userId]) {
          userTaskMap[userId] = [];
        }
        userTaskMap[userId].push(task._id);
      }
    }

    await Task.deleteMany({ _id: { $in: ids } });

    const io = getIO()

    for (const [userId, taksIds] of Object.entries(userTaskMap)) {



      io.to(userId).emit('taskDeleted', {
        ids: taksIds
      });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
};


exports.searchTasks = async (req, res) => {
  try {
    const { search } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('createdBy')
      .populate('assignedTo')
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};


exports.getNearDeadlineTasks = async (_, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // 00:00:00.000

    const threeDaysLater = new Date();
    threeDaysLater.setDate(startOfToday.getDate() + 3);
    threeDaysLater.setHours(23, 59, 59, 999); // End of third day

    const tasks = await Task.find({
      dueDate: { $gte: startOfToday, $lte: threeDaysLater },
      status: { $ne: "completed" },
    }).sort({ dueDate: 1 })
      .limit(5)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!tasks || tasks.length === 0) {
      return res.status(200).json({ message: "No near-deadline tasks found." });
    }

    return res.json(tasks);
  } catch (error) {
    console.error("Error fetching near-deadline tasks:", error);
    res.status(500).json({ message: "Error fetching near-deadline tasks." });
  }
};
