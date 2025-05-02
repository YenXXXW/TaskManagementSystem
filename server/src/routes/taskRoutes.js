const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTasksByStatus,
  getTasksByPriority
} = require('../controllers/taskController');




router.get('/status/:status', getTasksByStatus);
router.get('/priority/:priority', getTasksByPriority);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/', getTasks);
router.post('/', createTask);


module.exports = router; 