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
  searchTasks

} = require('../controllers/taskController');


router.get('/status/:status', getTasksByStatus);
router.get('/priority/:priority', getTasksByPriority);
router.post('/delete', deleteTask);
router.get('/search', searchTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.get('/', getTasks);
router.post('/', createTask);


module.exports = router; 
