"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const conversationRoutes_1 = __importDefault(require("./routes/conversationRoutes"));
const attachmentRoutes_1 = __importDefault(require("./routes/attachmentRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const auth_1 = require("./middlewares/auth");
const r2Utils_1 = require("./utils/r2Utils");
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const app = (0, express_1.default)();
exports.app = app;
const corsOptions = {
// origin: 'http://localhost:5173'
};
app.use((0, cors_1.default)(corsOptions));
exports.prisma = new client_1.PrismaClient();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger_output.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express_1.default.json());
app.use('/api/auth', authRoutes_1.default);
app.use('/api/conversations', auth_1.authenticateToken, conversationRoutes_1.default);
app.use('/api/attachments', auth_1.authenticateToken, attachmentRoutes_1.default);
app.use('/api/users', auth_1.authenticateToken, userRoutes_1.default);
(0, r2Utils_1.initializeBucketR2)();
app.use(errorHandler_1.default);
