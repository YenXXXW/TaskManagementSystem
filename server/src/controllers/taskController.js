const Task = require('../models/task');
const User = require('../models/user');
const Notification = require('../models/notificaton')
const { getIO } = require('../../config/socket')

// Get all tasks for the authenticated user
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

    res.json(tasks);
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
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
      .populate('assignedTo', 'name email');

    if (assignedUser) {
      const notification = new Notification({
        user: assignedUser._id,
        type: 'taskAssigned',
        message: `${req.user.name} assigned you a new task.`,
        task: task._id,
        createdBy: req.user._id,
      });
      await notification.save();

      const populatedNotification = await Notification.findById(notification._id).populate('createdBy');

      const io = getIO();
      io.to(assignedUser._id.toString()).emit('taskAssigned', {
        message: populatedNotification.message,
        task: populatedTask,
        notificationId: populatedNotification._id,
        createdAt: populatedNotification.createdAt,
        createdBy: populatedNotification.createdBy,
      });
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

    console.log("notifyUserId", notifyUserId)

    if (notifyUserId) {
      const notification = new Notification({
        user: notifyUserId,
        type: 'taskUpdated',
        message: `${req.user.name} updated task.`,
        task: task._id,
        createdBy: req.user._id
      });
      await notification.save();

      const populatedNotification = await Notification.findById(notification._id).populate('createdBy');

      const io = getIO()
      io.to(notifyUserId).emit('taskAssigned', {
        message: populatedNotification.message,
        task: updatedTask,
        notificationId: populatedNotification._id,
        createdAt: populatedNotification.createdAt,
        createdBy: populatedNotification.createdBy,
      });
    }

    res.status(200).json(updatedTask);

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only allow task creator to delete
    if (!task.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
};

// Get tasks by status
exports.getTasksByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const tasks = await Task.find({
      status,
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by status:', error);
    res.status(500).json({ message: 'Error fetching tasks by status' });
  }
};

// Get tasks by priority
exports.getTasksByPriority = async (req, res) => {
  try {
    const { priority } = req.params;
    const tasks = await Task.find({
      priority,
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by priority:', error);
    res.status(500).json({ message: 'Error fetching tasks by priority' });
  }
}; 
