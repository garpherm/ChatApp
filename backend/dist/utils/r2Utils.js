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
exports.initializeBucketR2 = initializeBucketR2;
exports.uploadFileToR2 = uploadFileToR2;
exports.getFileFromR2 = getFileFromR2;
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { config } = require('dotenv');
config();
let S3;
function initializeBucketR2() {
    return __awaiter(this, void 0, void 0, function* () {
        S3 = yield new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.ACCESS_KEY_ID,
                secretAccessKey: process.env.SECRET_ACCESS_KEY
            }
        });
    });
}
function getSignedURL(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield getSignedUrl(S3, new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: key
        }), {
            expiresIn: 24 * 60 * 60
        });
        return response;
    });
}
function putSignedURL(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield getSignedUrl(S3, new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: key
        }), {
            expiresIn: 24 * 60 * 60
        });
        return response;
    });
}
function uploadFileToR2(file, fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!S3) {
            throw new Error('S3 client not initialized');
        }
        let response = yield putSignedURL(fileName);
        yield fetch(response, { method: 'PUT', body: file });
        response = yield getSignedURL(fileName);
        return response;
    });
}
function getFileFromR2(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!S3) {
            throw new Error('S3 client not initialized');
        }
        const response = yield getSignedURL(fileName);
        return response;
    });
}
