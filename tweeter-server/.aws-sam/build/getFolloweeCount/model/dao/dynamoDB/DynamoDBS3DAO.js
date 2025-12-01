"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBS3DAO = void 0;
const S3Client_1 = __importDefault(require("../util/S3Client"));
const client_s3_1 = require("@aws-sdk/client-s3");
const BUCKET_NAME = "fall2025-cs340-tweeter";
const REGION = "us-west-2";
class DynamoDBS3DAO {
    async getFile(fileName) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
        });
        try {
            const response = await S3Client_1.default.send(command);
            if (!response.Body) {
                return null;
            }
            return await response.Body.transformToByteArray();
        }
        catch (error) {
            if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
                return null;
            }
            throw Error("s3 get file failed with: " + error);
        }
    }
    async putImage(fileName, imageStringBase64Encoded) {
        let decodedImageBuffer = Buffer.from(imageStringBase64Encoded, "base64");
        const s3Params = {
            Bucket: BUCKET_NAME,
            Key: "image/" + fileName,
            Body: decodedImageBuffer,
            ContentType: "image/png",
            ACL: client_s3_1.ObjectCannedACL.public_read,
        };
        const c = new client_s3_1.PutObjectCommand(s3Params);
        const client = new client_s3_1.S3Client({ region: REGION });
        try {
            await client.send(c);
            return (`https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/image/${fileName}`);
        }
        catch (error) {
            throw Error("s3 put image failed with: " + error);
        }
    }
}
exports.DynamoDBS3DAO = DynamoDBS3DAO;
