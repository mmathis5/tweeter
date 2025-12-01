"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBFactory = void 0;
const DynamoDBUserDAO_1 = require("./dynamoDB/DynamoDBUserDAO");
const DynamoDBAuthTokenDAO_1 = require("./dynamoDB/DynamoDBAuthTokenDAO");
const DynamoDBS3DAO_1 = require("./dynamoDB/DynamoDBS3DAO");
const DynamoDBStatusDAO_1 = require("./dynamoDB/DynamoDBStatusDAO");
const DynamoDBFollowDAO_1 = require("./dynamoDB/DynamoDBFollowDAO");
class DynamoDBFactory {
    getUserDAO() {
        return new DynamoDBUserDAO_1.DynamoDBUserDAO();
    }
    getStatusDAO() {
        return new DynamoDBStatusDAO_1.DynamoDBStatusDAO();
    }
    getFollowDAO() {
        return new DynamoDBFollowDAO_1.DynamoDBFollowDAO();
    }
    getAuthTokenDAO() {
        return new DynamoDBAuthTokenDAO_1.DynamoDBAuthTokenDAO();
    }
    getS3DAO() {
        return new DynamoDBS3DAO_1.DynamoDBS3DAO();
    }
}
exports.DynamoDBFactory = DynamoDBFactory;
