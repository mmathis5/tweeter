"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBFollowDAO = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const DynamoDBClient_1 = __importDefault(require("../util/DynamoDBClient"));
const USERS_TABLE_NAME = "Users";
const FOLLOWS_TABLE_NAME = "Follows";
const documentClient = lib_dynamodb_1.DynamoDBDocumentClient.from(DynamoDBClient_1.default);
class DynamoDBFollowDAO {
    async getFollowees(followerAlias, pageSize, lastFolloweeAlias) {
        const params = {
            TableName: FOLLOWS_TABLE_NAME,
            KeyConditionExpression: "followerAlias = :followerAlias",
            ExpressionAttributeValues: {
                ":followerAlias": followerAlias
            },
            Limit: pageSize + 1 // Fetch one extra to see if there are more pages
        };
        // Handle pagination - if lastFolloweeAlias is provided, start from that point
        if (lastFolloweeAlias !== null) {
            params.ExclusiveStartKey = {
                followerAlias: followerAlias,
                followeeAlias: lastFolloweeAlias
            };
        }
        try {
            const result = await documentClient.send(new lib_dynamodb_1.QueryCommand(params));
            if (!result.Items || result.Items.length === 0) {
                return [[], false];
            }
            // Determine if there are more pages
            const hasMore = result.Items.length > pageSize;
            const followeeItems = hasMore ? result.Items.slice(0, pageSize) : result.Items;
            // Extract followee aliases and fetch user data
            const followeeAliases = followeeItems.map(item => item.followeeAlias);
            const followees = [];
            // Fetch user data for each followee
            for (const alias of followeeAliases) {
                const userParams = {
                    TableName: USERS_TABLE_NAME,
                    Key: {
                        alias: alias
                    }
                };
                const userResult = await documentClient.send(new lib_dynamodb_1.GetCommand(userParams));
                if (userResult.Item) {
                    // Extract user data (excluding password hash) and create UserDto
                    const { passwordHash, ...userData } = userResult.Item;
                    followees.push({
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        alias: userData.alias,
                        imageUrl: userData.imageUrl
                    });
                }
            }
            return [followees, hasMore];
        }
        catch (error) {
            console.error("Error getting followees:", error);
            throw error;
        }
    }
    async getFollowers(followeeAlias, pageSize, lastFollowerAlias) {
        const GSI_NAME = "followeeAlias-followerAlias-index";
        // Build query parameters for GSI
        const params = {
            TableName: FOLLOWS_TABLE_NAME,
            IndexName: GSI_NAME,
            KeyConditionExpression: "followeeAlias = :followeeAlias",
            ExpressionAttributeValues: {
                ":followeeAlias": followeeAlias
            },
            Limit: pageSize + 1 // Fetch one extra to determine if there are more pages
        };
        // Handle pagination - if lastFollowerAlias is provided, start from that point
        if (lastFollowerAlias !== null) {
            params.ExclusiveStartKey = {
                followeeAlias: followeeAlias,
                followerAlias: lastFollowerAlias
            };
        }
        try {
            const result = await documentClient.send(new lib_dynamodb_1.QueryCommand(params));
            if (!result.Items || result.Items.length === 0) {
                return [[], false];
            }
            // Determine if there are more pages
            const hasMore = result.Items.length > pageSize;
            const followerItems = hasMore ? result.Items.slice(0, pageSize) : result.Items;
            // Extract follower aliases and fetch user data
            const followerAliases = followerItems.map(item => item.followerAlias);
            const followers = [];
            // Fetch user data for each follower
            for (const alias of followerAliases) {
                const userParams = {
                    TableName: USERS_TABLE_NAME,
                    Key: {
                        alias: alias
                    }
                };
                const userResult = await documentClient.send(new lib_dynamodb_1.GetCommand(userParams));
                if (userResult.Item) {
                    // Extract user data (excluding password hash) and create UserDto
                    const { passwordHash, ...userData } = userResult.Item;
                    followers.push({
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        alias: userData.alias,
                        imageUrl: userData.imageUrl
                    });
                }
            }
            return [followers, hasMore];
        }
        catch (error) {
            console.error("Error getting followers:", error);
            throw error;
        }
    }
    async isFollower(followerAlias, followeeAlias) {
        const params = {
            TableName: FOLLOWS_TABLE_NAME,
            Key: {
                followerAlias: followerAlias,
                followeeAlias: followeeAlias
            }
        };
        try {
            const result = await documentClient.send(new lib_dynamodb_1.GetCommand(params));
            return !!result.Item;
        }
        catch (error) {
            console.error("Error checking if follower is follower:", error);
            throw error;
        }
    }
    async getFolloweeCount(followerAlias) {
        const params = {
            TableName: USERS_TABLE_NAME,
            Key: {
                alias: followerAlias
            }
        };
        try {
            const result = await documentClient.send(new lib_dynamodb_1.GetCommand(params));
            if (!result.Item) {
                return 0;
            }
            return result.Item.followeeCount ?? 0;
        }
        catch (error) {
            console.error("Error getting followee count:", error);
            throw error;
        }
    }
    async getFollowerCount(followeeAlias) {
        const params = {
            TableName: USERS_TABLE_NAME,
            Key: {
                alias: followeeAlias
            }
        };
        try {
            const result = await documentClient.send(new lib_dynamodb_1.GetCommand(params));
            if (!result.Item) {
                return 0;
            }
            return result.Item.followerCount ?? 0;
        }
        catch (error) {
            console.error("Error getting follower count:", error);
            throw error;
        }
    }
    async follow(followerAlias, followeeAlias) {
        const followParams = {
            TableName: FOLLOWS_TABLE_NAME,
            Item: {
                followerAlias: followerAlias,
                followeeAlias: followeeAlias,
            }
        };
        try {
            await documentClient.send(new lib_dynamodb_1.PutCommand(followParams));
            // Increment followeeCount for the follower in the Users table
            const updateParamsFollower = {
                TableName: USERS_TABLE_NAME,
                Key: {
                    alias: followerAlias
                },
                UpdateExpression: "ADD followeeCount :inc",
                ExpressionAttributeValues: {
                    ":inc": 1
                }
            };
            await documentClient.send(new lib_dynamodb_1.UpdateCommand(updateParamsFollower));
            const updateParamsFollowee = {
                TableName: USERS_TABLE_NAME,
                Key: {
                    alias: followeeAlias
                },
                UpdateExpression: "ADD followerCount :inc",
                ExpressionAttributeValues: {
                    ":inc": 1
                }
            };
            await documentClient.send(new lib_dynamodb_1.UpdateCommand(updateParamsFollowee));
        }
        catch (error) {
            console.error("Error following:", error);
            throw error;
        }
    }
    async unfollow(followerAlias, followeeAlias) {
        const deleteParams = {
            TableName: FOLLOWS_TABLE_NAME,
            Key: {
                followerAlias: followerAlias,
                followeeAlias: followeeAlias
            }
        };
        try {
            await documentClient.send(new lib_dynamodb_1.DeleteCommand(deleteParams));
            // if successful, Decrement followeeCount for the follower in the Users table
            const updateParamsFollower = {
                TableName: USERS_TABLE_NAME,
                Key: {
                    alias: followerAlias
                },
                UpdateExpression: "ADD followeeCount :dec",
                ExpressionAttributeValues: {
                    ":dec": -1
                }
            };
            await documentClient.send(new lib_dynamodb_1.UpdateCommand(updateParamsFollower));
            const updateParamsFollowee = {
                TableName: USERS_TABLE_NAME,
                Key: {
                    alias: followeeAlias
                },
                UpdateExpression: "ADD followerCount :dec",
                ExpressionAttributeValues: {
                    ":dec": -1
                }
            };
            await documentClient.send(new lib_dynamodb_1.UpdateCommand(updateParamsFollowee));
        }
        catch (error) {
            console.error("Error unfollowing:", error);
            throw error;
        }
    }
}
exports.DynamoDBFollowDAO = DynamoDBFollowDAO;
