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
exports.joinRoomController = exports.disconnectingController = exports.offlineController = exports.onlineController = exports.getSocketDetails = void 0;
const app_1 = require("../app");
const getSocketDetails = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all rooms
    const result = yield app_1.prisma.participants.findMany({
        where: {
            userId,
            conversationId: {
                not: null
            }
        },
        select: {
            conversationId: true,
        },
    });
    return result.map((room) => { var _a; return (_a = room.conversationId) === null || _a === void 0 ? void 0 : _a.toString(); });
});
exports.getSocketDetails = getSocketDetails;
const onlineController = (io, socket) => {
    socket.on("user:online", (userId) => __awaiter(void 0, void 0, void 0, function* () {
        // Get user detaiils
        console.log(`User ${userId} is online with socket id ${socket.id}`);
        socket.data.userId = userId;
        const result = yield (0, exports.getSocketDetails)(userId);
        // Make user join rooms
        for (const room of result) {
            console.log(`User ${userId} is joining rooms ${room}`);
            socket.join(room);
            socket.to(room + "").emit("user:online", userId);
        }
        // TODO Update user status to online, last seen undefined
    }));
};
exports.onlineController = onlineController;
const offlineController = (io, socket) => {
    socket.on("user:offline", (userId) => __awaiter(void 0, void 0, void 0, function* () {
        // Get user detaiils
        const result = yield (0, exports.getSocketDetails)(userId);
        const time = new Date(Date.now()).toISOString();
        // TODO Update user status to offline, last seen
        socket
            .to(result)
            .emit("user:offline", { userId, time });
    }));
};
exports.offlineController = offlineController;
// socket disconnection
const disconnectingController = (io, socket) => {
    socket.on("disconnecting", (userId) => __awaiter(void 0, void 0, void 0, function* () {
        if (!userId)
            return;
        const result = yield (0, exports.getSocketDetails)(socket.data.userid);
        const time = new Date(Date.now()).toISOString();
        // TODO: update user status to offline, last seen
        socket
            .to(result)
            .emit("user:offline", { userId, time });
    }));
};
exports.disconnectingController = disconnectingController;
const joinRoomController = (io, socket) => {
    socket.on("user:joinRooms", ({ rooms }) => {
        socket.join(rooms);
    });
};
exports.joinRoomController = joinRoomController;
