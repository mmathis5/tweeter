"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBStatusDAO = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const DynamoDBClient_1 = __importDefault(require("../util/DynamoDBClient"));
const STORIES_TABLE_NAME = "Stories";
const FEEDS_TABLE_NAME = "Feed";
const documentClient = lib_dynamodb_1.DynamoDBDocumentClient.from(DynamoDBClient_1.default);
class DynamoDBStatusDAO {
    async getFeed(userAlias, pageSize, lastStatusTimestamp) {
        const params = {
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
            const result = await documentClient.send(new lib_dynamodb_1.QueryCommand(params));
            if (!result.Items || result.Items.length === 0) {
                return [[], false];
            }
            // Determine if there are more pages
            const hasMore = result.Items.length > pageSize;
            const statusItems = hasMore ? result.Items.slice(0, pageSize) : result.Items;
            // Convert items to StatusDto
            const statusDtos = statusItems.map(item => ({
                post: item.post,
                user: item.user,
                timestamp: item.timestamp,
                segments: item.segments
            }));
            return [statusDtos, hasMore];
        }
        catch (error) {
            console.error("Error getting feed:", error);
            throw error;
        }
    }
    async getStory(userAlias, pageSize, lastStatusTimestamp) {
        const params = {
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
            const result = await documentClient.send(new lib_dynamodb_1.QueryCommand(params));
            if (!result.Items || result.Items.length === 0) {
                return [[], false];
            }
            // Determine if there are more pages
            const hasMore = result.Items.length > pageSize;
            const statusItems = hasMore ? result.Items.slice(0, pageSize) : result.Items;
            // Convert items to StatusDto
            const statusDtos = statusItems.map(item => ({
                post: item.post,
                user: item.user,
                timestamp: item.timestamp,
                segments: item.segments
            }));
            return [statusDtos, hasMore];
        }
        catch (error) {
            console.error("Error getting story:", error);
            throw error;
        }
    }
    async postStatus(status) {
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
            await documentClient.send(new lib_dynamodb_1.PutCommand(storyParams));
        }
        catch (error) {
            console.error("Error posting status:", error);
            throw error;
        }
    }
    async addStatusToFeed(userAlias, status) {
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
            await documentClient.send(new lib_dynamodb_1.PutCommand(feedParams));
        }
        catch (error) {
            console.error("Error adding status to feed:", error);
            throw error;
        }
    }
}
exports.DynamoDBStatusDAO = DynamoDBStatusDAO;
