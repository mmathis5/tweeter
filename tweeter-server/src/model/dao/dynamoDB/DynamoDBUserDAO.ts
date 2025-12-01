import { User } from "tweeter-shared";
import { IUserDAO } from "../IUserDAO";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDBClient from "../util/DynamoDBClient";
import bcrypt from "bcryptjs";

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

    async login(alias: string, password: string): Promise<User | null> {
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

            const storedPasswordHash = result.Item.passwordHash;
            if (!storedPasswordHash) {
                return null;
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, storedPasswordHash);
            if (!isPasswordValid) {
                return null;
            }

            // Return user (excluding password hash)
            const { passwordHash, ...userData } = result.Item;
            return new User(
                userData.firstName,
                userData.lastName,
                userData.alias,
                userData.imageUrl
            );
        } catch (error) {
            console.error("Error during login:", error);
            throw error;
        }
    }

    async register(
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        imageUrl: string
    ): Promise<User> {
        // // Check if user already exists
        // const existingUser = await this.getUser(alias);
        // if (existingUser !== null) {
        //     throw new Error("User with this alias already exists");
        // }

        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user object
        const user = new User(firstName, lastName, alias, imageUrl);

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
            await documentClient.send(new PutCommand(params));
            return user;
        } catch (error) {
            console.error("Error registering user:", error);
            throw error;
        }
    }
}
