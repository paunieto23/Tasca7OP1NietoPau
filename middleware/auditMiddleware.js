const AuditLog = require('../models/AuditLog');

const auditMiddleware = (actionName, resourceType) => {
    return async (req, res, next) => {
        // Interceptem el mètode 'send' o 'json' de la resposta per saber quan ha acabat
        // i si ha sigut exitós. A més, intentem capturar canvis si podem.

        const originalJson = res.json;
        const originalStatus = res.status; // Capturar status

        let responseBody;
        let responseStatus = 200; // Default

        // Hook status
        res.status = function (code) {
            responseStatus = code;
            return originalStatus.apply(this, arguments);
        };

        // Hook json to capture body
        res.json = function (body) {
            responseBody = body;

            // Log logic here - after response is ready but before sending (mostly)
            // or we can do it fire-and-forget
            logAudit(req, responseStatus, body, actionName, resourceType);

            return originalJson.apply(this, arguments);
        };

        next();
    };
};

async function logAudit(req, status, body, actionName, resourceType) {
    if (!req.user) return; // Si no hi ha user, potser es login fallit o public, ho gestionem diferent o ignorem

    const isSuccess = status >= 200 && status < 300;
    const logStatus = isSuccess ? 'success' : 'error';
    const errorMessage = !isSuccess ? (body.error || 'Unknown error') : null;

    // Determinar Resource ID
    let resourceId = req.params.id || (body && body.data && body.data.id) || (body && body.data && body.data._id) || 'N/A';

    // Determinar canvis (simplificat)
    // Per PUT/POST podríem guardar req.body
    const changes = (req.method === 'POST' || req.method === 'PUT') ? req.body : null;
    // Evitar guardar passwords
    if (changes && changes.password) changes.password = '[HIDDEN]';

    // Determinar Action
    // Si no passem actionName, intentem deduir-la o usem mètode+url
    const finalAction = actionName || `${req.method}:${req.baseUrl}${req.path}`;

    await AuditLog.log(
        req.user._id,
        finalAction,
        resourceId,
        resourceType || 'unknown',
        logStatus,
        changes,
        req,
        errorMessage
    );
}

module.exports = auditMiddleware;
