const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Títol obligatori'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    cost: {
      type: Number,
      min: 0,
      default: 0,
    },
    hours_estimated: {
      type: Number,
      min: 0,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    // Relació amb l'usuari propietari
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
