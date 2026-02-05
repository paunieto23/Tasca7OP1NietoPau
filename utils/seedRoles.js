const Role = require('../models/Role');
const Permission = require('../models/Permission');

const seedRoles = async () => {
    try {
        // Obtenir permisos necessaris
        const allPermissions = await Permission.find({});

        // Helper para buscar ID de permiso
        const getPermId = (name) => {
            const p = allPermissions.find(per => per.name === name);
            return p ? p._id : null;
        };

        // 1. Admin Role (Tots els permisos)
        const adminPermissions = allPermissions.map(p => p._id);
        await Role.findOneAndUpdate(
            { name: 'admin' },
            {
                description: 'Administrador del sistema amb accés total',
                permissions: adminPermissions,
                isSystemRole: true
            },
            { upsert: true, new: true }
        );

        // 2. User Role (Bàsic per a tasques pròpies)
        // Nota: La lògica de "pròpies" es farà al controlador, aquí donem permís general sobre el recurs
        const userPermissionsNames = ['tasks:create', 'tasks:read', 'tasks:update', 'tasks:delete'];
        const userPermissions = userPermissionsNames.map(getPermId).filter(id => id);

        await Role.findOneAndUpdate(
            { name: 'user' },
            {
                description: 'Usuari estàndard',
                permissions: userPermissions,
                isSystemRole: true
            },
            { upsert: true, new: true }
        );

        // 3. Viewer Role
        const viewerPermissionsNames = ['tasks:read'];
        const viewerPermissions = viewerPermissionsNames.map(getPermId).filter(id => id);

        await Role.findOneAndUpdate(
            { name: 'viewer' },
            {
                description: 'Només pot veure tasques',
                permissions: viewerPermissions,
                isSystemRole: false
            },
            { upsert: true, new: true }
        );

        // 4. Editor Role
        const editorPermissionsNames = ['tasks:create', 'tasks:read', 'tasks:update', 'tasks:delete'];
        const editorPermissions = editorPermissionsNames.map(getPermId).filter(id => id);

        await Role.findOneAndUpdate(
            { name: 'editor' },
            {
                description: 'Pot gestionar tasques',
                permissions: editorPermissions,
                isSystemRole: false
            },
            { upsert: true, new: true }
        );

        console.log('✅ Rols sembrats correctament');
    } catch (error) {
        console.error('❌ Error sembrant rols:', error);
    }
};

module.exports = seedRoles;
