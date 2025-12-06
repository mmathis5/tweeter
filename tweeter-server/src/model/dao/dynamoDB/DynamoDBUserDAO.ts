import { User } from "tweeter-shared";
import { IUserDAO } from "../IUserDAO";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDBClient from "../util/DynamoDBClient";

const TABLE_NAME = "Users";
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);

export class DynamoDBUserDAO implements IUserDAO {
    async getUser(alias: string): Promise<User | null> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                alias: alias
            }
        };

        try {
            const result = await documentClient.send(new GetCommand(params));
            
            if (!result.Item) {
                return null;
            }

            // Extract user data (excluding password hash)
            const { passwordHash, ...userData } = result.Item;
            return new User(
                userData.firstName,
                userData.lastName,
                userData.alias,
                userData.imageUrl
            );
        } catch (error) {
            console.error("Error getting user:", error);
            throw error;
        }
    }

    async putUser(user: User): Promise<void> {
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
            await documentClient.send(new PutCommand(params));
        } catch (error) {
            console.error("Error putting user:", error);
            throw error;
        }
    }

    async getUserWithPasswordHash(alias: string): Promise<{ user: User; passwordHash: string } | null> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                alias: alias
            }
        };

        try {
            const result = await documentClient.send(new GetCommand(params));
            
            if (!result.Item) {
                return null;
            }

            const { passwordHash, ...userData } = result.Item;
            const user = new User(
                userData.firstName,
                userData.lastName,
                userData.alias,
                userData.imageUrl
            );

            return {
                user: user,
                passwordHash: passwordHash || ""
            };
        } catch (error) {
            console.error("Error getting user with password hash:", error);
            throw error;
        }
    }

    async putUserWithPasswordHash(
        firstName: string,
        lastName: string,
        alias: string,
        passwordHash: string,
        imageUrl: string
    ): Promise<User> {
        const user = new User(firstName, lastName, alias, imageUrl);

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
            await documentClient.send(new PutCommand(params));
            return user;
        } catch (error) {
            console.error("Error putting user with password hash:", error);
            throw error;
        }
    }

    // Template method for updating count fields
    private async updateCount(
        alias: string,
        countType: "followerCount" | "followeeCount",
        increment: number,
        errorMessage: string
    ): Promise<void> {
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
            await documentClient.send(new UpdateCommand(params));
        } catch (error) {
            console.error(errorMessage, error);
            throw error;
        }
    }

    async incrementFollowerCount(alias: string): Promise<void> {
        await this.updateCount(alias, "followerCount", 1, "Error incrementing follower count:");
    }

    async decrementFollowerCount(alias: string): Promise<void> {
        await this.updateCount(alias, "followerCount", -1, "Error decrementing follower count:");
    }

    async incrementFolloweeCount(alias: string): Promise<void> {
        await this.updateCount(alias, "followeeCount", 1, "Error incrementing followee count:");
    }

    async decrementFolloweeCount(alias: string): Promise<void> {
        await this.updateCount(alias, "followeeCount", -1, "Error decrementing followee count:");
    }
}
