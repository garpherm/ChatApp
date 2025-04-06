"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const authUtils_1 = require("../utils/authUtils");
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Authentication token required' });
        return;
    }
    const payload = (0, authUtils_1.verifyToken)(token);
    if (!payload) {
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
    }
    req.userId = payload.userId;
    next();
}
