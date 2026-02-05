const AuditLog = require('../models/AuditLog');
const ErrorResponse = require('../utils/errorResponse');

exports.getAuditLogs = async (req, res, next) => {
    try {
        let { userId, action, startDate, endDate, page, limit } = req.query;

        page = parseInt(page, 10) || 1;
        limit = parseInt(limit, 10) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        if (userId) query.userId = userId;
        if (action) query.action = action;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLog.countDocuments(query);

        res.status(200).json({
            success: true,
            count: total,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit)
            },
            data: logs
        });
    } catch (error) {
        next(error);
    }
};

exports.getAuditLogById = async (req, res, next) => {
    try {
        const log = await AuditLog.findById(req.params.id).populate('userId', 'name email');
        if (!log) return next(new ErrorResponse('Log no trobat', 404));

        res.status(200).json({ success: true, data: log });
    } catch (e) { next(e); }
};

exports.getUserAuditLogs = async (req, res, next) => {
    try {
        const logs = await AuditLog.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(100); // hard limit for example

        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (e) { next(e); }
};

exports.getAuditStats = async (req, res, next) => {
    try {
        const totalActions = await AuditLog.countDocuments();

        const topActions = await AuditLog.aggregate([
            { $group: { _id: "$action", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { action: "$_id", count: 1, _id: 0 } }
        ]);

        const successCount = await AuditLog.countDocuments({ status: 'success' });
        const successRate = totalActions > 0 ? ((successCount / totalActions) * 100).toFixed(1) : 0;

        // This aggregation will fail if userId is not populated or joinable easily in aggregate without lookup.
        // But AuditLog has userId as ObjectId.
        const topUsers = await AuditLog.aggregate([
            { $group: { _id: "$userId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: "$user" },
            { $project: { userId: "$_id", userName: "$user.name", count: 1, _id: 0 } }
        ]);

        const recentErrors = await AuditLog.aggregate([
            { $match: { status: 'error' } },
            { $group: { _id: "$action", count: { $sum: 1 }, error: { $first: "$errorMessage" } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { action: "$_id", count: 1, error: 1, _id: 0 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalActions,
                successRate: parseFloat(successRate),
                topActions,
                topUsers,
                recentErrors
            }
        });
    } catch (e) { next(e); }
};
