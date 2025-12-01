import { AuthToken } from "tweeter-shared";
import { IAuthTokenDAO } from "../IAuthTokenDAO";
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDBClient from "../util/DynamoDBClient";

const TABLE_NAME = "AuthTokens";
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);

export class DynamoDBAuthTokenDAO implements IAuthTokenDAO {
    async putToken(token: AuthToken, userAlias: string): Promise<void> {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                token: token.token,
                userAlias: userAlias,
                timestamp: token.timestamp
            }
        };

        try {
            await documentClient.send(new PutCommand(params));
        } catch (error) {
            console.error("Error putting token:", error);
            throw error;
        }
    }

    async getToken(token: string): Promise<string | null> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                token: token
            }
        };

        try {
            const result = await documentClient.send(new GetCommand(params));
            
            if (!result.Item) {
                return null;
            }

            return result.Item.userAlias || null;
        } catch (error) {
            console.error("Error getting token:", error);
            throw error;
        }
    }

    async getTokenData(token: string): Promise<{ userAlias: string; timestamp: number } | null> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                token: token
            }
        };

        try {
            const result = await documentClient.send(new GetCommand(params));
            
            if (!result.Item) {
                return null;
            }

            return {
                userAlias: result.Item.userAlias,
                timestamp: result.Item.timestamp
            };
        } catch (error) {
            console.error("Error getting token data:", error);
            throw error;
        }
    }

    async deleteToken(token: string): Promise<void> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                token: token
            }
        };

        try {
            await documentClient.send(new DeleteCommand(params));
        } catch (error) {
            console.error("Error deleting token:", error);
            throw error;
        }
    }
}

