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
exports.getConversationMembers = exports.sendMessage = exports.getConversation = exports.getConversations = exports.createNewConversation = void 0;
const app_1 = require("../app");
const Conversation_1 = require("../models/Conversation");
const Message_1 = require("../models/Message");
const createNewConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, participantIds } = req.body;
        const userId = req.userId;
        const conversation = yield app_1.prisma.conversations.create({
            data: {
                name,
                type: participantIds.length > 1 ? 'group' : 'private',
                Participants: {
                    create: [
                        { userId: userId },
                        ...participantIds.map((id) => ({ userId: id }))
                    ]
                },
            },
            select: Conversation_1.ConversationSelect
        });
        res.status(201).json(conversation);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating conversation' });
    }
});
exports.createNewConversation = createNewConversation;
const getConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const conversations = yield app_1.prisma.conversations.findMany({
            where: {
                Participants: {
                    some: {
                        userId: userId
                    }
                }
            },
            select: Conversation_1.ConversationSelect
        });
        res.json(conversations);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching conversations' });
    }
});
exports.getConversations = getConversations;
const getConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const conversation = yield app_1.prisma.conversations.findFirst({
            where: {
                id: parseInt(id),
                Participants: {
                    some: {
                        userId: userId
                    }
                }
            },
            select: Conversation_1.ConversationSelect
        });
        if (!conversation) {
            res.status(404).json({ error: 'Conversation not found' });
            return;
        }
        res.json(conversation);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching conversation' });
    }
});
exports.getConversation = getConversation;
const sendMessage = (_a) => __awaiter(void 0, [_a], void 0, function* ({ content, conversationId, userId }) {
    const message = yield app_1.prisma.messages.create({
        data: {
            content,
            conversationId,
            senderId: userId
        },
        select: Message_1.MessageSelect
    });
    return message;
});
exports.sendMessage = sendMessage;
const getConversationMembers = (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    const members = yield app_1.prisma.participants.findMany({
        where: {
            conversationId
        },
        select: {
            userId: true
        }
    });
    return members.map((member) => member.userId);
});
exports.getConversationMembers = getConversationMembers;
