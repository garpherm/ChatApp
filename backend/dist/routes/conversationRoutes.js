"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const conversationController_1 = require("../controllers/conversationController");
const router = express_1.default.Router();
router.post('/', conversationController_1.createNewConversation);
router.get('/', conversationController_1.getConversations);
router.get('/:id', conversationController_1.getConversation);
exports.default = router;
