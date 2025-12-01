import { IStatusDAO } from "../IStatusDAO";
import { Status, StatusDto } from "tweeter-shared";
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDBClient from "../util/DynamoDBClient";

const STORIES_TABLE_NAME = "Stories";
const FEEDS_TABLE_NAME = "Feed";
const FOLLOWS_TABLE_NAME = "Follows";
const GSI_NAME = "followeeAlias-followerAlias-index";
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);

export class DynamoDBStatusDAO implements IStatusDAO {
    async getFeed(userAlias: string, pageSize: number, lastStatusTimestamp: number | null): Promise<[StatusDto[], boolean]> {
        const params: any = {
            TableName: FEEDS_TABLE_NAME,
            KeyConditionExpression: "userAlias = :userAlias",
            ExpressionAttributeValues: {
                ":userAlias": userAlias
            },
            ScanIndexForward: false, // Sort descending (newest first)
            Limit: pageSize + 1 // Fetch one extra to determine if there are more pages
        };

        // Handle pagination - if lastStatusTimestamp is provided, start from that point
        if (lastStatusTimestamp !== null) {
            params.ExclusiveStartKey = {
                userAlias: userAlias,
                timestamp: lastStatusTimestamp
            };
        }

        try {
            const result = await documentClient.send(new QueryCommand(params));
            
            if (!result.Items || result.Items.length === 0) {
                return [[], false];
            }

            // Determine if there are more pages
            const hasMore = result.Items.length > pageSize;
            const statusItems = hasMore ? result.Items.slice(0, pageSize) : result.Items;

            // Convert items to StatusDto
            const statusDtos: StatusDto[] = statusItems.map(item => ({
                post: item.post,
                user: item.user,
                timestamp: item.timestamp,
                segments: item.segments
            }));

            return [statusDtos, hasMore];
        } catch (error) {
            console.error("Error getting feed:", error);
            throw error;
        }
    }

    async getStory(userAlias: string, pageSize: number, lastStatusTimestamp: number | null): Promise<[StatusDto[], boolean]> {
        const params: any = {
            TableName: STORIES_TABLE_NAME,
            KeyConditionExpression: "userAlias = :userAlias",
            ExpressionAttributeValues: {
                ":userAlias": userAlias
            },
            ScanIndexForward: false, // Sort descending (newest first)
            Limit: pageSize + 1 // Fetch one extra to determine if there are more pages
        };

        // Handle pagination - if lastStatusTimestamp is provided, start from that point
        if (lastStatusTimestamp !== null) {
            params.ExclusiveStartKey = {
                userAlias: userAlias,
                timestamp: lastStatusTimestamp
            };
        }

        try {
            const result = await documentClient.send(new QueryCommand(params));
            
            if (!result.Items || result.Items.length === 0) {
                return [[], false];
            }

            // Determine if there are more pages
            const hasMore = result.Items.length > pageSize;
            const statusItems = hasMore ? result.Items.slice(0, pageSize) : result.Items;

            // Convert items to StatusDto
            const statusDtos: StatusDto[] = statusItems.map(item => ({
                post: item.post,
                user: item.user,
                timestamp: item.timestamp,
                segments: item.segments
            }));

            return [statusDtos, hasMore];
        } catch (error) {
            console.error("Error getting story:", error);
            throw error;
        }
    }

    async postStatus(status: Status): Promise<void> {
        const statusDto = status.dto;
        const authorAlias = status.user.alias;

        // Convert PostSegment class instances to plain objects for DynamoDB storage
        // PostSegment has private properties, so we need to extract via getters
        const segmentsPlain = statusDto.segments.map(segment => ({
            text: segment.text,
            startPostion: segment.startPostion,
            endPosition: segment.endPosition,
            type: segment.type
        }));

        // Store status in Stories table
        const storyParams = {
            TableName: STORIES_TABLE_NAME,
            Item: {
                userAlias: authorAlias,
                timestamp: statusDto.timestamp,
                post: statusDto.post,
                user: statusDto.user,
                segments: segmentsPlain
            }
        };

        try {
            await documentClient.send(new PutCommand(storyParams));

            // Get all followers of the status author
            const followerAliases = await this.getAllFollowers(authorAlias);

            // Add status to each follower's feed
            const feedPromises = followerAliases.map(followerAlias => {
                const feedParams = {
                    TableName: FEEDS_TABLE_NAME,
                    Item: {
                        userAlias: followerAlias,
                        timestamp: statusDto.timestamp,
                        post: statusDto.post,
                        user: statusDto.user,
                        segments: segmentsPlain
                    }
                };
                return documentClient.send(new PutCommand(feedParams));
            });

            await Promise.all(feedPromises);
        } catch (error) {
            console.error("Error posting status:", error);
            throw error;
        }
    }

    private async getAllFollowers(followeeAlias: string): Promise<string[]> {
        const followerAliases: string[] = [];
        let lastEvaluatedKey: any = undefined;

        do {
            const params: any = {
                TableName: FOLLOWS_TABLE_NAME,
                IndexName: GSI_NAME,
                KeyConditionExpression: "followeeAlias = :followeeAlias",
                ExpressionAttributeValues: {
                    ":followeeAlias": followeeAlias
                },
                Limit: 100 // Fetch in batches of 100
            };

            if (lastEvaluatedKey !== undefined) {
                params.ExclusiveStartKey = lastEvaluatedKey;
            }

            try {
                const result = await documentClient.send(new QueryCommand(params));
                
                if (result.Items && result.Items.length > 0) {
                    const batchAliases = result.Items.map(item => item.followerAlias);
                    followerAliases.push(...batchAliases);
                }

                lastEvaluatedKey = result.LastEvaluatedKey;
            } catch (error) {
                console.error("Error getting all followers:", error);
                throw error;
            }
        } while (lastEvaluatedKey !== undefined);

        return followerAliases;
    }
}

