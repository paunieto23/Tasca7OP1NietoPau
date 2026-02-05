const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const permissionController = require('../controllers/permissionController');
const { protect } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const auditMiddleware = require('../middleware/auditMiddleware');

// Totes les rutes protegides i requereixen permissos de gestió de permisos
router.use(protect);

router.post(
    '/',
    checkPermission('permissions:manage'),
    auditMiddleware('permissions:create', 'permission'),
    [
        check('name', 'El nom és obligatori').not().isEmpty(),
        check('description', 'La descripció és obligatòria').not().isEmpty(),
        check('category', 'La categoria és obligatòria').not().isEmpty(),
    ],
    permissionController.createPermission
);

router.get(
    '/',
    checkPermission('permissions:read'),
    permissionController.getAllPermissions
);

router.get(
    '/categories',
    checkPermission('permissions:read'),
    permissionController.getPermissionsByCategory
);

router.put(
    '/:id',
    checkPermission('permissions:manage'),
    auditMiddleware('permissions:update', 'permission'),
    permissionController.updatePermission
);

router.delete(
    '/:id',
    checkPermission('permissions:manage'),
    auditMiddleware('permissions:delete', 'permission'),
    permissionController.deletePermission
);

module.exports = router;
