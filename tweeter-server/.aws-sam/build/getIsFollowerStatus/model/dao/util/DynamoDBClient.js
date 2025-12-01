"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const dynamoDBClient = new client_dynamodb_1.DynamoDBClient({
    region: process.env.AWS_REGION || "us-west-2",
});
exports.default = dynamoDBClient;
