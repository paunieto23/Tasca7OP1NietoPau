const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const roleController = require('../controllers/roleController');
const { protect } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const auditMiddleware = require('../middleware/auditMiddleware');

// Protegir i verificar permís roles:manage o roles:read
router.use(protect);

router.post(
    '/',
    checkPermission('roles:manage'),
    auditMiddleware('roles:create', 'role'),
    [
        check('name', 'El nom és obligatori').not().isEmpty(),
    ],
    roleController.createRole
);

router.get(
    '/',
    checkPermission('roles:read'),
    roleController.getAllRoles
);

router.get(
    '/:id',
    checkPermission('roles:read'),
    roleController.getRoleById
);

router.put(
    '/:id',
    checkPermission('roles:manage'),
    auditMiddleware('roles:update', 'role'),
    roleController.updateRole
);

router.delete(
    '/:id',
    checkPermission('roles:manage'),
    auditMiddleware('roles:delete', 'role'),
    roleController.deleteRole
);

router.post(
    '/:id/permissions',
    checkPermission('roles:manage'),
    auditMiddleware('roles:add-permission', 'role'),
    roleController.addPermissionToRole
);

router.delete(
    '/:id/permissions/:permissionId',
    checkPermission('roles:manage'),
    auditMiddleware('roles:remove-permission', 'role'),
    roleController.removePermissionFromRole
);

module.exports = router;
