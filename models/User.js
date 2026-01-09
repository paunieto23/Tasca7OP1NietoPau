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
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
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

// Eliminar password quan es retorna a JSON
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  return obj;
};

// Índex únic per email
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
