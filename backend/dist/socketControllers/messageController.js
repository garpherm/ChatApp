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
exports.messagingController = void 0;
const conversationController_1 = require("../controllers/conversationController");
const app_1 = require("../app");
const messagingController = (io, socket) => {
    socket.on("user:newMessage", (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, conversationId, content }) {
        if (!userId)
            return;
        // Save message to database
        const result = yield (0, conversationController_1.sendMessage)({ content, conversationId, userId });
        // Get all sockets in room
        const socketsInRoom = yield io.in(conversationId.toString()).allSockets();
        console.log(`Sockets in room ${conversationId}: ${socketsInRoom.size}`);
        // Get all users in conversation
        const members = yield (0, conversationController_1.getConversationMembers)(conversationId);
        for (const member of members) {
            console.log(`User ${member} is in room ${conversationId}`);
        }
        // Get all socket connections
        const allSockets = yield io.fetchSockets();
        for (const socket of allSockets) {
            console.log(`Socket ${socket.id} is connected with user ${socket.data.userId}`);
        }
        // Find and join missing users' sockets to room
        members.forEach(memberId => {
            allSockets.forEach(socket => {
                if (socket.data.userId === memberId && !socketsInRoom.has(socket.id)) {
                    console.log(`User ${memberId} is joining room ${conversationId}`);
                    socket.join(conversationId + "");
                }
            });
        });
        // Broadcast message to room
        console.log(`User ${userId} sent message to room ${conversationId} with socket id ${socket.id}`);
        io.timeout(180000)
            .to(conversationId + "")
            .emit("user:sendMessage", {
            conversationId,
            message: result
        });
    }));
    socket.on("user:readMessage", (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, messageId, conversationId }) {
        if (!userId || !messageId || !conversationId)
            return;
        yield app_1.prisma.messagesReadStatus.create({
            data: {
                userId,
                messageId,
                conversationId
            }
        });
        io.to(conversationId + "").emit("user:messageRead", { messageId, userId, conversationId });
    }));
};
exports.messagingController = messagingController;
