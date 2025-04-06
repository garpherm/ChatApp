"use strict";
/**
{
  id: string;
  name: string;
  type: string;
  Participants: {
    Users: {
      id: string;
      username: string;
    }[];
  };
  Messages: {
    senderId: string;
    content: string;
    Attachments: {
      url: string;
    }[];
    createdAt: string;
  }
}
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationSelect = void 0;
const client_1 = require("@prisma/client");
exports.ConversationSelect = {
    id: true,
    name: true,
    type: true,
    Participants: {
        select: {
            Users: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    },
    Messages: {
        select: {
            senderId: true,
            content: true,
            Attachments: {
                select: {
                    url: true
                }
            },
            createdAt: true,
        },
        orderBy: {
            createdAt: client_1.Prisma.SortOrder.asc
        }
    }
};
