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

// PUT /api/admin/users/:id/role (admin)
exports.changeUserRole = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (req.user._id.toString() === userId) {
      return next(new ErrorResponse('No pots canviar el teu propi rol', 400));
    }

    if (!['user', 'admin'].includes(role)) {
      return next(new ErrorResponse('Rol no vàlid (user | admin)', 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorResponse('Usuari no trobat', 404));
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Rol actualitzat correctament',
      data: user,
    });
  } catch (err) {
    return next(err);
  }
};
