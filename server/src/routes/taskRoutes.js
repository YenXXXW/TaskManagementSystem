const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTasksByStatus,
  getTasksByPriority,
  searchTasks,
  getNearDeadlineTasks

} = require('../controllers/taskController');


router.get('/status', getTasksByStatus);
router.get('/priority', getTasksByPriority);
router.post('/delete', deleteTask);
router.get('/search', searchTasks);
router.get('/nearDeathline', getNearDeadlineTasks)
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.get('/', getTasks);
router.post('/', createTask);


module.exports = router; 
