const Permission = require('../models/Permission');
const ErrorResponse = require('../utils/errorResponse');

exports.createPermission = async (req, res, next) => {
    try {
        const { name, description, category } = req.body;

        // Validar duplicats
        const exists = await Permission.findOne({ name });
        if (exists) {
            return next(new ErrorResponse('Ja existeix un permís amb aquest nom', 400));
        }

        const permission = await Permission.create({ name, description, category });

        res.status(201).json({
            success: true,
            message: 'Permís creat correctament',
            data: permission
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllPermissions = async (req, res, next) => {
    try {
        const permissions = await Permission.find().sort({ category: 1, name: 1 });
        res.status(200).json({
            success: true,
            count: permissions.length,
            data: permissions
        });
    } catch (error) {
        next(error);
    }
};

exports.getPermissionsByCategory = async (req, res, next) => {
    try {
        const categories = await Permission.distinct('category');
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

exports.updatePermission = async (req, res, next) => {
    try {
        const { description } = req.body; // Només deixem actualitzar la descripció per seguretat

        const permission = await Permission.findByIdAndUpdate(
            req.params.id,
            { description },
            { new: true, runValidators: true }
        );

        if (!permission) {
            return next(new ErrorResponse('Permís no trobat', 404));
        }

        res.status(200).json({
            success: true,
            data: permission
        });
    } catch (error) {
        next(error);
    }
};

exports.deletePermission = async (req, res, next) => {
    try {
        const permission = await Permission.findById(req.params.id);

        if (!permission) {
            return next(new ErrorResponse('Permís no trobat', 404));
        }

        if (permission.isSystemPermission) {
            return next(new ErrorResponse('No es poden eliminar permisos del sistema', 403));
        }

        await permission.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Permís eliminat'
        });
    } catch (error) {
        next(error);
    }
};
