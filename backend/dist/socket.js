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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const server_1 = __importDefault(require("./server"));
const connectionController_1 = require("./socketControllers/connectionController");
const messageController_1 = require("./socketControllers/messageController");
const io = new socket_io_1.Server(server_1.default, {
    cors: {
    // origin: 'http://localhost:5173',
    // methods: ['GET', 'POST']
    }
});
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token
//   if (!token) {
//     return next(new Error('Authentication token required'))
//   }
//   const payload = verifyToken(token)
//   if (!payload) {
//     return next(new Error('Invalid or expired token'))
//   }
//   socket.data.userId = payload.userId
//   next()
// })
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    // -------------Connection controls -------------- //
    // socket come online
    (0, connectionController_1.onlineController)(io, socket);
    // socket goes offline
    (0, connectionController_1.offlineController)(io, socket);
    // socket disconnecting
    (0, connectionController_1.disconnectingController)(io, socket);
    // socket joins new room
    (0, connectionController_1.joinRoomController)(io, socket);
    //--------------------------------------------------//
    // -------------Message controls -------------- //
    (0, messageController_1.messagingController)(io, socket);
}));
