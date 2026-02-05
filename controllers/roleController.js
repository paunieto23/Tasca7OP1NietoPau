const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.createRole = async (req, res, next) => {
    try {
        const { name, description, permissions } = req.body;

        // Verificar permisos
        if (permissions && permissions.length > 0) {
            const count = await Permission.countDocuments({ _id: { $in: permissions } });
            if (count !== permissions.length) {
                return next(new ErrorResponse('Un o més permisos no existeixen', 400));
            }
        }

        const role = await Role.create({
            name,
            description,
            permissions
        });

        const populatedRole = await Role.findById(role._id).populate('permissions');

        res.status(201).json({
            success: true,
            message: 'Rol creat correctament',
            data: populatedRole
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllRoles = async (req, res, next) => {
    try {
        const roles = await Role.find().populate('permissions');
        res.status(200).json({
            success: true,
            count: roles.length,
            data: roles
        });
    } catch (error) {
        next(error);
    }
};

exports.getRoleById = async (req, res, next) => {
    try {
        const role = await Role.findById(req.params.id).populate('permissions');
        if (!role) return next(new ErrorResponse('Rol no trobat', 404));

        res.status(200).json({
            success: true,
            data: role
        });
    } catch (error) {
        next(error);
    }
};

exports.updateRole = async (req, res, next) => {
    try {
        const { name, description, permissions } = req.body;

        let role = await Role.findById(req.params.id);
        if (!role) return next(new ErrorResponse('Rol no trobat', 404));

        // Si és sistema, no canviar nom
        if (role.isSystemRole && name && name !== role.name) {
            return next(new ErrorResponse('No es pot renombrar un rol del sistema', 403));
        }

        // Update
        if (name) role.name = name;
        if (description) role.description = description;
        if (permissions) role.permissions = permissions; // S'assumeix array d'IDs

        await role.save();

        const updatedRole = await Role.findById(role._id).populate('permissions');

        res.status(200).json({
            success: true,
            data: updatedRole
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteRole = async (req, res, next) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) return next(new ErrorResponse('Rol no trobat', 404));

        if (role.isSystemRole) {
            return next(new ErrorResponse('No pots eliminar un rol del sistema', 403));
        }

        // Reasignar usuaris al rol per defecte 'user' abans d'eliminar?
        // Opcionalment: buscar usuaris amb aquest rol i treure'l o donar error.
        // Per simplicitat, si té usuaris, prohibir? O treure rol.
        // L'enunciat diu "Reasignar usuaris a rol per defecte"

        const userRole = await Role.findOne({ name: 'user' });
        if (userRole) {
            // Buscar usuaris que tinguin aquest rol
            const usersWithRole = await User.find({ roles: role._id });
            for (const user of usersWithRole) {
                user.roles = user.roles.filter(r => r.toString() !== role._id.toString());
                // Si es queda sense rols, posar 'user'
                if (user.roles.length === 0) {
                    user.roles.push(userRole._id);
                }
                await user.save();
            }
        }

        await role.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Rol eliminat'
        });
    } catch (error) {
        next(error);
    }
};

exports.addPermissionToRole = async (req, res, next) => {
    try {
        const { permissionId } = req.body;
        const role = await Role.findById(req.params.id);
        if (!role) return next(new ErrorResponse('Rol no trobat', 404));

        await role.addPermission(permissionId);

        const updated = await Role.findById(req.params.id).populate('permissions');
        res.status(200).json({ success: true, data: updated });
    } catch (e) { next(e); }
};

exports.removePermissionFromRole = async (req, res, next) => {
    try {
        const { permissionId } = req.params;
        const role = await Role.findById(req.params.id);
        if (!role) return next(new ErrorResponse('Rol no trobat', 404));

        await role.removePermission(permissionId);

        const updated = await Role.findById(req.params.id).populate('permissions');
        res.status(200).json({ success: true, data: updated });
    } catch (e) { next(e); }
};
