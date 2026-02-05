const Permission = require('../models/Permission');

const permissions = [
    // Tasques
    { name: 'tasks:create', description: 'Crear tasques', category: 'tasks', isSystemPermission: true },
    { name: 'tasks:read', description: 'Veure tasques', category: 'tasks', isSystemPermission: true },
    { name: 'tasks:update', description: 'Editar tasques', category: 'tasks', isSystemPermission: true },
    { name: 'tasks:delete', description: 'Eliminar tasques', category: 'tasks', isSystemPermission: true },

    // Usuaris
    { name: 'users:manage', description: 'Gestionar usuaris', category: 'users', isSystemPermission: true },
    { name: 'users:read', description: 'Veure usuaris', category: 'users', isSystemPermission: true },

    // Rols
    { name: 'roles:manage', description: 'Gestionar rols', category: 'roles', isSystemPermission: true },
    { name: 'roles:read', description: 'Veure rols', category: 'roles', isSystemPermission: true },

    // Permisos
    { name: 'permissions:manage', description: 'Gestionar permisos', category: 'permissions', isSystemPermission: true },
    { name: 'permissions:read', description: 'Veure permisos', category: 'permissions', isSystemPermission: true },

    // Auditoria
    { name: 'audit:read', description: 'Veure logs d\'auditoria', category: 'audit', isSystemPermission: true },

    // Reports
    { name: 'reports:view', description: 'Veure informes', category: 'reports', isSystemPermission: true },
    { name: 'reports:export', description: 'Exportar informes', category: 'reports', isSystemPermission: true },
];

const seedPermissions = async () => {
    try {
        for (const perm of permissions) {
            await Permission.findOneAndUpdate(
                { name: perm.name },
                perm,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }
        console.log('✅ Permisos sembrats correctament');
    } catch (error) {
        console.error('❌ Error sembrant permisos:', error);
    }
};

module.exports = seedPermissions;
