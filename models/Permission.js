const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nom del permís és obligatori'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La descripció és obligatòria'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'La categoria és obligatòria'],
      trim: true,
      // ex: 'tasks', 'users', 'roles', 'reports'
    },
    isSystemPermission: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Permission', permissionSchema);
