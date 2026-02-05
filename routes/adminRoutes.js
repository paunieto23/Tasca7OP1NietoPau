const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const auditMiddleware = require('../middleware/auditMiddleware');

// Importar nous controladors de Rols, Permisos i Auditoria que s'han passat a fitxers separats
// però aquí mantenim les rutes d'usuari
const {
  getAllUsers,
  getAllTasks,
  deleteUser,
  assignRole,
  removeRole,
  getUserPermissions
} = require('../controllers/adminController');

// Rutes per rols
router.use('/roles', require('./roleRoutes'));

// Rutes per permisos
router.use('/permissions', require('./permissionRoutes'));

// Rutes per auditoria
router.use('/audit-logs', require('./auditRoutes'));

// Rutes d'administració d'usuaris existents/noves
router.get('/users', protect, checkPermission('users:read'), getAllUsers);
router.get('/tasks', protect, checkPermission('tasks:read'), getAllTasks); // Admin viewing all tasks?
router.delete('/users/:id', protect, checkPermission('users:manage'), auditMiddleware('users:delete', 'user'), deleteUser);

// Noves rutes gestió rols usuaris
router.post('/users/:userId/roles', protect, checkPermission('users:manage'), auditMiddleware('users:assign-role', 'user'), assignRole);
router.delete('/users/:userId/roles/:roleId', protect, checkPermission('users:manage'), auditMiddleware('users:remove-role', 'user'), removeRole);
router.get('/users/:userId/permissions', protect, checkPermission('users:read'), getUserPermissions);

module.exports = router;
