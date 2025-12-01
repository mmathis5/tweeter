"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBAuthTokenDAO = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const DynamoDBClient_1 = __importDefault(require("../util/DynamoDBClient"));
const TABLE_NAME = "AuthTokens";
const documentClient = lib_dynamodb_1.DynamoDBDocumentClient.from(DynamoDBClient_1.default);
class DynamoDBAuthTokenDAO {
    async putToken(token, userAlias) {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                token: token.token,
                userAlias: userAlias,
                timestamp: token.timestamp
            }
        };
        try {
            await documentClient.send(new lib_dynamodb_1.PutCommand(params));
        }
        catch (error) {
            console.error("Error putting token:", error);
            throw error;
        }
    }
    async getToken(token) {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                token: token
            }
        };
        try {
            const result = await documentClient.send(new lib_dynamodb_1.GetCommand(params));
            if (!result.Item) {
                return null;
            }
            return result.Item.userAlias || null;
        }
        catch (error) {
            console.error("Error getting token:", error);
            throw error;
        }
    }
    async getTokenData(token) {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                token: token
            }
        };
        try {
            const result = await documentClient.send(new lib_dynamodb_1.GetCommand(params));
            if (!result.Item) {
                return null;
            }
            return {
                userAlias: result.Item.userAlias,
                timestamp: result.Item.timestamp
            };
        }
        catch (error) {
            console.error("Error getting token data:", error);
            throw error;
        }
    }
    async deleteToken(token) {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                token: token
            }
        };
        try {
            await documentClient.send(new lib_dynamodb_1.DeleteCommand(params));
        }
        catch (error) {
            console.error("Error deleting token:", error);
            throw error;
        }
    }
}
exports.DynamoDBAuthTokenDAO = DynamoDBAuthTokenDAO;
