const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nom del rol és obligatori'],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        permissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Permission',
            },
        ],
        isSystemRole: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Mètodes del model
roleSchema.methods.addPermission = function (permissionId) {
    if (!this.permissions.includes(permissionId)) {
        this.permissions.push(permissionId);
    }
    return this.save();
};

roleSchema.methods.removePermission = function (permissionId) {
    this.permissions = this.permissions.filter(
        (p) => p.toString() !== permissionId.toString()
    );
    return this.save();
};

module.exports = mongoose.model('Role', roleSchema);
