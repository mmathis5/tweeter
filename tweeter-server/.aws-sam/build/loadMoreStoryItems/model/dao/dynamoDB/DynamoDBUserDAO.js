"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBUserDAO = void 0;
const tweeter_shared_1 = require("tweeter-shared");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const DynamoDBClient_1 = __importDefault(require("../util/DynamoDBClient"));
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
    async getUserWithPasswordHash(alias) {
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
            const { passwordHash, ...userData } = result.Item;
            const user = new tweeter_shared_1.User(userData.firstName, userData.lastName, userData.alias, userData.imageUrl);
            return {
                user: user,
                passwordHash: passwordHash || ""
            };
        }
        catch (error) {
            console.error("Error getting user with password hash:", error);
            throw error;
        }
    }
    async putUserWithPasswordHash(firstName, lastName, alias, passwordHash, imageUrl) {
        const user = new tweeter_shared_1.User(firstName, lastName, alias, imageUrl);
        // Store user with password hash (password should already be hashed by service layer)
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
            console.error("Error putting user with password hash:", error);
            throw error;
        }
    }
    // Template method for updating count fields
    async updateCount(alias, countType, increment, errorMessage) {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                alias: alias
            },
            UpdateExpression: `ADD ${countType} :val`,
            ExpressionAttributeValues: {
                ":val": increment
            }
        };
        try {
            await documentClient.send(new lib_dynamodb_1.UpdateCommand(params));
        }
        catch (error) {
            console.error(errorMessage, error);
            throw error;
        }
    }
    async incrementFollowerCount(alias) {
        await this.updateCount(alias, "followerCount", 1, "Error incrementing follower count:");
    }
    async decrementFollowerCount(alias) {
        await this.updateCount(alias, "followerCount", -1, "Error decrementing follower count:");
    }
    async incrementFolloweeCount(alias) {
        await this.updateCount(alias, "followeeCount", 1, "Error incrementing followee count:");
    }
    async decrementFolloweeCount(alias) {
        await this.updateCount(alias, "followeeCount", -1, "Error decrementing followee count:");
    }
}
exports.DynamoDBUserDAO = DynamoDBUserDAO;
