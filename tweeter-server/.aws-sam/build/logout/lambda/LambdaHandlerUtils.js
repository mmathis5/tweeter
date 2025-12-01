"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAuth = void 0;
const DynamoDBFactory_1 = require("../model/dao/DynamoDBFactory");
const AuthService_1 = require("../model/service/AuthService");
function withAuth(handler) {
    return async (request) => {
        const daoFactory = new DynamoDBFactory_1.DynamoDBFactory();
        const authService = new AuthService_1.AuthService(daoFactory);
        const isAuthenticated = await authService.isAuthenticated(request.token);
        if (!isAuthenticated) {
            throw new Error("unauthorized or invalid or expired authentication token");
        }
        return await handler(request, daoFactory);
    };
}
exports.withAuth = withAuth;
