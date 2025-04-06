"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSelect = void 0;
/**
  {
    senderId: string,
    content: string,
    Attachments: {
      url: string
    }[],
    createdAt: string
  }
 */
exports.MessageSelect = {
    senderId: true,
    content: true,
    Attachments: {
        select: {
            url: true
        }
    },
    createdAt: true
};
