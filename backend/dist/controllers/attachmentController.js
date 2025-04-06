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
exports.uploadAttachment = void 0;
const app_1 = require("../app");
const r2Utils_1 = require("../utils/r2Utils");
const uploadAttachment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        const messageId = parseInt(req.body.messageId);
        if (!file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const fileName = `${Date.now()}-${file.originalname}`;
        const url = yield (0, r2Utils_1.uploadFileToR2)(file.buffer, fileName);
        const attachment = yield app_1.prisma.attachments.create({
            data: {
                fileName,
                url,
                Messages: { connect: { id: messageId } }
            }
        });
        res
            .status(200)
            .json({ success: true, attachmentUrl: url, attachmentId: attachment.id });
    }
    catch (error) {
        next(error);
    }
});
exports.uploadAttachment = uploadAttachment;
