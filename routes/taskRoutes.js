const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { createTaskValidation, updateTaskValidation } = require('../middleware/validators/taskValidators');
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  updateTaskImage,
  resetTaskImage,
} = require('../controllers/taskController');

// Totes les rutes de tasques requereixen auth
router.use(auth);

router.get('/stats', getTaskStats);
router.post('/', createTaskValidation, createTask);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTaskValidation, updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/image', updateTaskImage);
router.put('/:id/image/reset', resetTaskImage);

module.exports = router;
