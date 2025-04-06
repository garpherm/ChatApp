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
exports.getAllUser = getAllUser;
const app_1 = require("../app");
function getAllUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { search } = req.query;
        let users;
        try {
            if (!search) {
                users = yield app_1.prisma.users.findMany({
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                });
            }
            users = yield app_1.prisma.users.findMany({
                where: {
                    OR: [
                        {
                            username: {
                                contains: search
                            }
                        },
                        {
                            email: {
                                contains: search
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            });
            res.status(200).json(users);
        }
        catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    });
}
