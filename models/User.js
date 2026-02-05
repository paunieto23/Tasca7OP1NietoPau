const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, 'Email obligatori'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    password: {
      type: String,
      required: [true, 'Contrasenya obligatòria'],
      minlength: 6,
      select: false, // per defecte no retornem el hash
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook: xifrar contrasenya quan canvia
userSchema.pre('save', async function preSave(next) {
  try {
    if (!this.isModified('password')) return next();

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Comparar contrasenya en login/change-password
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  // this.password pot no estar seleccionada; assegura't d'haver fet select('+password')
  return bcrypt.compare(candidatePassword, this.password);
};

// Mètodes per gestionar rols i permisos
userSchema.methods.addRole = function (roleId) {
  if (!this.roles.includes(roleId)) {
    this.roles.push(roleId);
  }
  return this.save();
};

userSchema.methods.removeRole = function (roleId) {
  this.roles = this.roles.filter((r) => r.toString() !== roleId.toString());
  return this.save();
};

userSchema.methods.getEffectivePermissions = async function () {
  // Populate rols i els seus permisos
  await this.populate({
    path: 'roles',
    populate: { path: 'permissions' },
  });

  const permissions = new Set();
  this.roles.forEach((role) => {
    if (role.permissions) {
      role.permissions.forEach((permission) => {
        permissions.add(permission.name);
      });
    }
  });

  return Array.from(permissions);
};

userSchema.methods.hasPermission = async function (permissionName) {
  const permissions = await this.getEffectivePermissions();
  return permissions.includes(permissionName);
};

// Eliminar password quan es retorna a JSON
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  return obj;
};

// Índex únic per email
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
