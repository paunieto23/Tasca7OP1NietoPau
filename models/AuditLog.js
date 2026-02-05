const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
            trim: true,
        },
        resource: {
            type: String, // ID del recurs (tasca, usuari, etc.)
            trim: true,
        },
        resourceType: {
            type: String, // 'task', 'user', 'role', etc.
            trim: true,
        },
        status: {
            type: String,
            enum: ['success', 'error'],
            required: true,
        },
        changes: {
            type: Object, // Detalls dels canvis (oldValue -> newValue)
        },
        errorMessage: {
            type: String,
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
    },
    { timestamps: true }
);

// Mètodes estàtics per facilitar el registre
auditLogSchema.statics.log = async function (
    userId,
    action,
    resource,
    resourceType,
    status,
    changes,
    req,
    errorMessage = null
) {
    try {
        const logEntry = {
            userId,
            action,
            resource,
            resourceType,
            status,
            changes,
            errorMessage,
            ipAddress: req?.ip || req?.socket?.remoteAddress,
            userAgent: req?.headers?.['user-agent'],
        };
        return await this.create(logEntry);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error creating audit log:', error);
    }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
