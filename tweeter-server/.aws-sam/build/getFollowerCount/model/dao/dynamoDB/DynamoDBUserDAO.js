"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBUserDAO = void 0;
const tweeter_shared_1 = require("tweeter-shared");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const DynamoDBClient_1 = __importDefault(require("../util/DynamoDBClient"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const TABLE_NAME = "Users";
const documentClient = lib_dynamodb_1.DynamoDBDocumentClient.from(DynamoDBClient_1.default);
class DynamoDBUserDAO {
    async getUser(alias) {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                alias: alias
            }
        };
        try {
            const result = await documentClient.send(new lib_dynamodb_1.GetCommand(params));
            if (!result.Item) {
                return null;
            }
            // Extract user data (excluding password hash)
            const { passwordHash, ...userData } = result.Item;
            return new tweeter_shared_1.User(userData.firstName, userData.lastName, userData.alias, userData.imageUrl);
        }
        catch (error) {
            console.error("Error getting user:", error);
            throw error;
        }
    }
    async putUser(user) {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                alias: user.alias,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl
            }
        };
        try {
            await documentClient.send(new lib_dynamodb_1.PutCommand(params));
        }
        catch (error) {
            console.error("Error putting user:", error);
            throw error;
        }
    }
    async login(alias, password) {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                alias: alias
            }
        };
        try {
            const result = await documentClient.send(new lib_dynamodb_1.GetCommand(params));
            if (!result.Item) {
                return null;
            }
            const storedPasswordHash = result.Item.passwordHash;
            if (!storedPasswordHash) {
                return null;
            }
            // Verify password
            const isPasswordValid = await bcryptjs_1.default.compare(password, storedPasswordHash);
            if (!isPasswordValid) {
                return null;
            }
            // Return user (excluding password hash)
            const { passwordHash, ...userData } = result.Item;
            return new tweeter_shared_1.User(userData.firstName, userData.lastName, userData.alias, userData.imageUrl);
        }
        catch (error) {
            console.error("Error during login:", error);
            throw error;
        }
    }
    async register(firstName, lastName, alias, password, imageUrl) {
        // // Check if user already exists
        // const existingUser = await this.getUser(alias);
        // if (existingUser !== null) {
        //     throw new Error("User with this alias already exists");
        // }
        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        // Create user object
        const user = new tweeter_shared_1.User(firstName, lastName, alias, imageUrl);
        // Store user with password hash
        const params = {
            TableName: TABLE_NAME,
            Item: {
                alias: user.alias,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
                passwordHash: passwordHash,
                followerCount: 0,
                followeeCount: 0
            }
        };
        try {
            await documentClient.send(new lib_dynamodb_1.PutCommand(params));
            return user;
        }
        catch (error) {
            console.error("Error registering user:", error);
            throw error;
        }
    }
}
exports.DynamoDBUserDAO = DynamoDBUserDAO;
