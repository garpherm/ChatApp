"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const app_1 = require("../app");
const authUtils_1 = require("../utils/authUtils");
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, username, password } = req.body;
            const existingUser = yield app_1.prisma.users.findUnique({
                where: { email }
            });
            if (existingUser) {
                res.status(400).json({ error: 'Email already in use' });
                return;
            }
            const hashedPassword = yield (0, authUtils_1.hashPassword)(password);
            const user = yield app_1.prisma.users.create({
                data: {
                    email,
                    username,
                    hashed_password: hashedPassword
                }
            });
            const token = (0, authUtils_1.generateToken)(user.id);
            res.status(201).json({
                user: { id: user.id, email: user.email, username: user.username },
                token
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Error registering user' });
        }
    });
}
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            const user = yield app_1.prisma.users.findUnique({ where: { email } });
            if (!user) {
                res.status(400).json({ error: 'Invalid credentials' });
                return;
            }
            const isPasswordValid = yield (0, authUtils_1.comparePasswords)(password, user.hashed_password);
            if (!isPasswordValid) {
                res.status(400).json({ error: 'Invalid credentials' });
                return;
            }
            const token = (0, authUtils_1.generateToken)(user.id);
            res.json({
                user: { id: user.id, email: user.email, username: user.username },
                token
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Error logging in' });
        }
    });
}
