const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const ErrorResponse = require('../utils/errorResponse');

function formatValidationErrors(result) {
  return result.array().map((e) => ({ field: e.param, message: e.msg }));
}

// POST /api/tasks (protected)
exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: formatValidationErrors(errors) });
    }

    const { title, description, cost, hours_estimated, completed } = req.body;

    const task = await Task.create({
      title,
      description,
      cost,
      hours_estimated,
      completed: completed === undefined ? false : completed,
      user: req.user._id,
    });

    return res.status(201).json({ success: true, data: task });
  } catch (err) {
    return next(err);
  }
};

// GET /api/tasks (protected) -> només tasques de l'usuari
exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    return next(err);
  }
};

// GET /api/tasks/:id (protected) -> només si és propietari
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return next(new ErrorResponse('Tasca no trobada', 404));
    }
    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    return next(err);
  }
};

// PUT /api/tasks/:id (protected)
exports.updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: formatValidationErrors(errors) });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return next(new ErrorResponse('Tasca no trobada', 404));
    }

    const updatable = ['title', 'description', 'cost', 'hours_estimated', 'completed'];
    updatable.forEach((k) => {
      if (req.body[k] !== undefined) task[k] = req.body[k];
    });

    await task.save();

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/tasks/:id (protected)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return next(new ErrorResponse('Tasca no trobada', 404));
    }

    await task.deleteOne();

    return res.status(200).json({ success: true, message: 'Tasca eliminada correctament' });
  } catch (err) {
    return next(err);
  }
};

// GET /api/tasks/stats (protected)
exports.getTaskStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const total = await Task.countDocuments({ user: userId });
    const completed = await Task.countDocuments({ user: userId, completed: true });
    const pending = total - completed;

    const agg = await Task.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' },
          totalHours: { $sum: '$hours_estimated' },
        },
      },
    ]);

    const totals = agg[0] || { totalCost: 0, totalHours: 0 };

    return res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        pending,
        totalCost: totals.totalCost,
        totalHoursEstimated: totals.totalHours,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// PUT /api/tasks/:id/image (protected) - exemple simple d'actualitzar URL d'imatge
exports.updateTaskImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return next(new ErrorResponse('imageUrl és obligatori', 400));
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return next(new ErrorResponse('Tasca no trobada', 404));
    }

    task.imageUrl = imageUrl;
    await task.save();

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    return next(err);
  }
};

// PUT /api/tasks/:id/image/reset (protected)
exports.resetTaskImage = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return next(new ErrorResponse('Tasca no trobada', 404));
    }

    task.imageUrl = undefined;
    await task.save();

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    return next(err);
  }
};
