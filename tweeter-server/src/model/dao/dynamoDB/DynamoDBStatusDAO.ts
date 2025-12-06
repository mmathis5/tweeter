import { IStatusDAO } from "../IStatusDAO";
import { Status, StatusDto } from "tweeter-shared";
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDBClient from "../util/DynamoDBClient";

const STORIES_TABLE_NAME = "Stories";
const FEEDS_TABLE_NAME = "Feed";
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
        // This method should only store the status in the Stories table
        // Business logic (getting followers, updating feeds) should be in service layer
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
        } catch (error) {
            console.error("Error posting status:", error);
            throw error;
        }
    }

    async addStatusToFeed(userAlias: string, status: Status): Promise<void> {
        // This method adds a status to a specific user's feed
        const statusDto = status.dto;

        // Convert PostSegment class instances to plain objects for DynamoDB storage
        const segmentsPlain = statusDto.segments.map(segment => ({
            text: segment.text,
            startPostion: segment.startPostion,
            endPosition: segment.endPosition,
            type: segment.type
        }));

        const feedParams = {
            TableName: FEEDS_TABLE_NAME,
            Item: {
                userAlias: userAlias,
                timestamp: statusDto.timestamp,
                post: statusDto.post,
                user: statusDto.user,
                segments: segmentsPlain
            }
        };

        try {
            await documentClient.send(new PutCommand(feedParams));
        } catch (error) {
            console.error("Error adding status to feed:", error);
            throw error;
        }
    }
}

