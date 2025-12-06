import { IFollowDAO } from "../IFollowDAO";
import { UserDto } from "tweeter-shared";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDBClient from "../util/DynamoDBClient";

const FOLLOWS_TABLE_NAME = "Follows";
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);

export class DynamoDBFollowDAO implements IFollowDAO {
    async getFollowees(followerAlias: string, pageSize: number, lastFolloweeAlias: string | null): Promise<[UserDto[], boolean]> {
        // This method should only return aliases from Follows table
        // Service layer will fetch user data
        const [followeeAliases, hasMore] = await this.getFolloweeAliases(followerAlias, pageSize, lastFolloweeAlias);
        
        // Return empty array - service layer will populate with user data
        return [[], hasMore];
    }

    async getFolloweeAliases(followerAlias: string, pageSize: number, lastFolloweeAlias: string | null): Promise<[string[], boolean]> {
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

            // Extract followee aliases only (no Users table access)
            const followeeAliases = followeeItems.map(item => item.followeeAlias);

            return [followeeAliases, hasMore];
        } catch (error) {
            console.error("Error getting followee aliases:", error);
            throw error;
        }
    }

    async getFollowers(followeeAlias: string, pageSize: number, lastFollowerAlias: string | null): Promise<[UserDto[], boolean]> {
        // This method should only return aliases from Follows table
        // Service layer will fetch user data
        const [followerAliases, hasMore] = await this.getFollowerAliases(followeeAlias, pageSize, lastFollowerAlias);
        
        // Return empty array - service layer will populate with user data
        return [[], hasMore];
    }

    async getFollowerAliases(followeeAlias: string, pageSize: number, lastFollowerAlias: string | null): Promise<[string[], boolean]> {
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

            // Extract follower aliases only (no Users table access)
            const followerAliases = followerItems.map(item => item.followerAlias);

            return [followerAliases, hasMore];
        } catch (error) {
            console.error("Error getting follower aliases:", error);
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
        // Count from Follows table, not Users table
        let count = 0;
        let lastFolloweeAlias: string | null = null;
        const pageSize = 100;

        do {
            const [followeeAliases, hasMore] = await this.getFolloweeAliases(followerAlias, pageSize, lastFolloweeAlias);
            count += followeeAliases.length;
            lastFolloweeAlias = hasMore && followeeAliases.length > 0 ? followeeAliases[followeeAliases.length - 1] : null;
        } while (lastFolloweeAlias !== null);

        return count;
    }

    async getFollowerCount(followeeAlias: string): Promise<number> {
        // Count from Follows table, not Users table
        let count = 0;
        let lastFollowerAlias: string | null = null;
        const pageSize = 100;

        do {
            const [followerAliases, hasMore] = await this.getFollowerAliases(followeeAlias, pageSize, lastFollowerAlias);
            count += followerAliases.length;
            lastFollowerAlias = hasMore && followerAliases.length > 0 ? followerAliases[followerAliases.length - 1] : null;
        } while (lastFollowerAlias !== null);

        return count;
    }

    async follow(followerAlias: string, followeeAlias: string): Promise<void> {
        // This method should only work with Follows table
        // Count updates should be handled by service layer via UserDAO
        const followParams = {
            TableName: FOLLOWS_TABLE_NAME,
            Item: {
                followerAlias: followerAlias,
                followeeAlias: followeeAlias,
            }
        };
        try {
            await documentClient.send(new PutCommand(followParams));
        } catch (error) {
            console.error("Error following:", error);
            throw error;
        }
    }

    async unfollow(followerAlias: string, followeeAlias: string): Promise<void> {
        // This method should only work with Follows table
        // Count updates should be handled by service layer via UserDAO
        const deleteParams = {
            TableName: FOLLOWS_TABLE_NAME,
            Key: {
                followerAlias: followerAlias,
                followeeAlias: followeeAlias
            }
        };
        try {
            await documentClient.send(new DeleteCommand(deleteParams));
        } catch (error) {
            console.error("Error unfollowing:", error);
            throw error;
        }
    }
}

