const Notification = require('../models/notificaton');

exports.createNotification = async (req, res) => {
  try {
    const { userId, type, message, taskId } = req.body;

    if (!userId || !type || !message || !taskId) {
      return res.status(400).json({
        message: 'Missing required fields: userId, type, message, taskId',
      });
    }
    const notification = await Notification.create({
      user: userId,
      type,
      message,
      task: taskId,
    });

    res.status(201).json(notification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ message: 'Notification creation failed' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        message: 'Missing required field: id',
      });
    }

    const notifications = await Notification.find({ user: userId })
      .populate('task', 'title')
      .populate('createdBy', 'name _id email')
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Fetching notifications failed' });
  }
};
exports.markAsRead = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: 'Missing or invalid required field: ids',
      });
    }

    await Notification.updateMany(
      { _id: { $in: ids } },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};

