const express = require('express');
const router = express.Router();

const auditController = require('../controllers/auditController');
const { protect } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

router.use(protect);
router.use(checkPermission('audit:read'));

router.get('/', auditController.getAuditLogs);
router.get('/stats', auditController.getAuditStats);
router.get('/user/:userId', auditController.getUserAuditLogs);
router.get('/:id', auditController.getAuditLogById);

module.exports = router;
