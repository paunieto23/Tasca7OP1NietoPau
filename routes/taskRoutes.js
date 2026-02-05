const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const auditMiddleware = require('../middleware/auditMiddleware');
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
router.use(protect);

router.get('/stats', checkPermission('tasks:read'), getTaskStats);

router.post(
  '/',
  checkPermission('tasks:create'),
  auditMiddleware('tasks:create', 'task'),
  createTaskValidation,
  createTask
);

router.get(
  '/',
  checkPermission('tasks:read'),
  getAllTasks
);

router.get(
  '/:id',
  checkPermission('tasks:read'),
  getTaskById
);

router.put(
  '/:id',
  checkPermission('tasks:update'),
  auditMiddleware('tasks:update', 'task'),
  updateTaskValidation,
  updateTask
);

router.delete(
  '/:id',
  checkPermission('tasks:delete'),
  auditMiddleware('tasks:delete', 'task'),
  deleteTask
);

router.put(
  '/:id/image',
  checkPermission('tasks:update'),
  auditMiddleware('tasks:update-image', 'task'),
  updateTaskImage
);

router.put(
  '/:id/image/reset',
  checkPermission('tasks:update'),
  auditMiddleware('tasks:reset-image', 'task'),
  resetTaskImage
);

module.exports = router;
