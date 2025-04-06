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
exports.setupSocketHandlers = setupSocketHandlers;
const app_1 = require("../app");
const authUtils_1 = require("./authUtils");
const socketUserMap = new Map();
const rooms = new Map();
function setupSocketHandlers(io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication token required'));
        }
        const payload = (0, authUtils_1.verifyToken)(token);
        if (!payload) {
            return next(new Error('Invalid or expired token'));
        }
        socket.data.userId = payload.userId;
        next();
    });
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.data.userId}`);
        socketUserMap.set(socket.data.userId, socket.id);
        socket.on('joinRoom', (roomId) => {
            var _a;
            rooms.set(roomId, [...(rooms.get(roomId) || []), socket.data.userId]);
            console.log(typeof roomId);
            socket.join(roomId.toString());
            console.log(`length: ${(_a = rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.length}`);
            console.log(`User joined room ${roomId}`);
        });
        socket.on('inviteClient', ({ roomId, clientsId }) => {
            for (const clientId of clientsId) {
                console.log(`Inviting client ${clientId} to room ${roomId}`);
                const socketId = socketUserMap.get(clientId);
                if (socketId) {
                    const targetSocket = io.sockets.sockets.get(socketId);
                    if (targetSocket) {
                        socket.to(targetSocket.id).emit('invitedTo', { roomId });
                    }
                }
            }
        });
        socket.on('sendMessage', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { senderId, content, conversationId, attachmentIds } = data;
                const message = yield app_1.prisma.messages.create({
                    data: {
                        content,
                        Users: { connect: { id: senderId } },
                        Conversations: { connect: { id: conversationId } },
                        Attachments: {
                            connect: attachmentIds.map((id) => ({ id }))
                        }
                    },
                    include: {
                        Attachments: true
                    }
                });
                console.log(message);
                if (message.conversationId) {
                    io.to(message.conversationId.toString()).emit('newMessage', message);
                }
            }
            catch (error) {
                console.error('Error sending message:', error);
            }
        }));
        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
}
