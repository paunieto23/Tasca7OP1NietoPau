const User = require('../models/User');
const Task = require('../models/Task');
const ErrorResponse = require('../utils/errorResponse');

// GET /api/admin/users (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/admin/tasks (admin)
exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().populate('user', 'name email role createdAt');
    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/admin/users/:id (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    if (req.user._id.toString() === userId) {
      return next(new ErrorResponse('No et pots eliminar a tu mateix', 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorResponse('Usuari no trobat', 404));
    }

    // Esborrem tasques de l'usuari
    await Task.deleteMany({ user: userId });
    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Usuari i tasques eliminats correctament',
    });
  } catch (err) {
    return next(err);
  }
};

// POST /api/admin/users/:userId/roles
exports.assignRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    const user = await User.findById(userId);
    if (!user) return next(new ErrorResponse('Usuari no trobat', 404));

    const Role = require('../models/Role');
    const role = await Role.findById(roleId);
    if (!role) return next(new ErrorResponse('El rol no existeix', 404));

    await user.addRole(roleId);

    // Obtenir user actualitzat
    const updatedUser = await User.findById(userId).populate('roles');

    return res.status(200).json({
      success: true,
      message: 'Rol assignat correctament',
      data: {
        userId: updatedUser._id,
        roles: updatedUser.roles
      }
    });
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/admin/users/:userId/roles/:roleId
exports.removeRole = async (req, res, next) => {
  try {
    const { userId, roleId } = req.params;

    const user = await User.findById(userId);
    if (!user) return next(new ErrorResponse('Usuari no trobat', 404));

    // No permetre que l'usuari quedi sense rols?
    // "No permetre que un usuari quedi sense rol"
    if (user.roles.length <= 1 && user.roles.includes(roleId)) {
      return next(new ErrorResponse('No es pot eliminar l\'últim rol de l\'usuari', 400));
    }

    await user.removeRole(roleId);

    return res.status(200).json({
      success: true,
      message: 'Rol eliminat correctament'
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/admin/users/:userId/permissions
exports.getUserPermissions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return next(new ErrorResponse('Usuari no trobat', 404));

    const permissions = await user.getEffectivePermissions();

    return res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        permissions
      }
    });
  } catch (e) { next(e); }
};
