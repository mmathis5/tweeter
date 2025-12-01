import { IFollowDAO } from "../IFollowDAO";
import { UserDto } from "tweeter-shared";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDBClient from "../util/DynamoDBClient";

const USERS_TABLE_NAME = "Users";
const FOLLOWS_TABLE_NAME = "Follows";
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);

export class DynamoDBFollowDAO implements IFollowDAO {
    async getFollowees(followerAlias: string, pageSize: number, lastFolloweeAlias: string | null): Promise<[UserDto[], boolean]> {
        const params: any = {
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
            const result = await documentClient.send(new QueryCommand(params));
            
            if (!result.Items || result.Items.length === 0) {
                return [[], false];
            }

            // Determine if there are more pages
            const hasMore = result.Items.length > pageSize;
            const followeeItems = hasMore ? result.Items.slice(0, pageSize) : result.Items;

            // Extract followee aliases and fetch user data
            const followeeAliases = followeeItems.map(item => item.followeeAlias);
            const followees: UserDto[] = [];

            // Fetch user data for each followee
            for (const alias of followeeAliases) {
                const userParams = {
                    TableName: USERS_TABLE_NAME,
                    Key: {
                        alias: alias
                    }
                };

                const userResult = await documentClient.send(new GetCommand(userParams));
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
        } catch (error) {
            console.error("Error getting followees:", error);
            throw error;
        }
    }

    async getFollowers(followeeAlias: string, pageSize: number, lastFollowerAlias: string | null): Promise<[UserDto[], boolean]> {
        const GSI_NAME = "followeeAlias-followerAlias-index";
        
        // Build query parameters for GSI
        const params: any = {
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
            const result = await documentClient.send(new QueryCommand(params));
            
            if (!result.Items || result.Items.length === 0) {
                return [[], false];
            }

            // Determine if there are more pages
            const hasMore = result.Items.length > pageSize;
            const followerItems = hasMore ? result.Items.slice(0, pageSize) : result.Items;

            // Extract follower aliases and fetch user data
            const followerAliases = followerItems.map(item => item.followerAlias);
            const followers: UserDto[] = [];

            // Fetch user data for each follower
            for (const alias of followerAliases) {
                const userParams = {
                    TableName: USERS_TABLE_NAME,
                    Key: {
                        alias: alias
                    }
                };

                const userResult = await documentClient.send(new GetCommand(userParams));
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
        } catch (error) {
            console.error("Error getting followers:", error);
            throw error;
        }
    }

    async isFollower(followerAlias: string, followeeAlias: string): Promise<boolean> {
        const params = {
            TableName: FOLLOWS_TABLE_NAME,
            Key: {
                followerAlias: followerAlias,
                followeeAlias: followeeAlias
            }
        }
        try {
            const result = await documentClient.send(new GetCommand(params));
            return !!result.Item;
        } catch (error) {
            console.error("Error checking if follower is follower:", error);
            throw error;
        }
    }

    async getFolloweeCount(followerAlias: string): Promise<number> {
        const params = {
            TableName: USERS_TABLE_NAME,
            Key: {
                alias: followerAlias
            }
        };

        try {
            const result = await documentClient.send(new GetCommand(params));
            
            if (!result.Item) {
                return 0;
            }

            return result.Item.followeeCount ?? 0;
        } catch (error) {
            console.error("Error getting followee count:", error);
            throw error;
        }
    }

    async getFollowerCount(followeeAlias: string): Promise<number> {
        const params = {
            TableName: USERS_TABLE_NAME,
            Key: {
                alias: followeeAlias
            }
        };

        try {
            const result = await documentClient.send(new GetCommand(params));
            
            if (!result.Item) {
                return 0;
            }

            return result.Item.followerCount ?? 0;
        } catch (error) {
            console.error("Error getting follower count:", error);
            throw error;
        }
    }

    async follow(followerAlias: string, followeeAlias: string): Promise<void> {
        const followParams = {
            TableName: FOLLOWS_TABLE_NAME,
            Item: {
                followerAlias: followerAlias,
                followeeAlias: followeeAlias,
            }
        };
        try {
            await documentClient.send(new PutCommand(followParams));
            
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

            await documentClient.send(new UpdateCommand(updateParamsFollower));

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
            await documentClient.send(new UpdateCommand(updateParamsFollowee));
        } catch (error) {
            console.error("Error following:", error);
            throw error;
        }
    }

    async unfollow(followerAlias: string, followeeAlias: string): Promise<void> {
        const deleteParams = {
            TableName: FOLLOWS_TABLE_NAME,
            Key: {
                followerAlias: followerAlias,
                followeeAlias: followeeAlias
            }
        };
        try {
            await documentClient.send(new DeleteCommand(deleteParams));
            
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
            await documentClient.send(new UpdateCommand(updateParamsFollower));
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
            await documentClient.send(new UpdateCommand(updateParamsFollowee));
        } catch (error) {
            console.error("Error unfollowing:", error);
            throw error;
        }
    }
}

