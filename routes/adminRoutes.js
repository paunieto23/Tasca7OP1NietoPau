const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const {
  getAllUsers,
  getAllTasks,
  deleteUser,
  changeUserRole,
} = require('../controllers/adminController');

router.get('/users', auth, roleCheck(['admin']), getAllUsers);
router.get('/tasks', auth, roleCheck(['admin']), getAllTasks);
router.delete('/users/:id', auth, roleCheck(['admin']), deleteUser);
router.put('/users/:id/role', auth, roleCheck(['admin']), changeUserRole);

module.exports = router;
