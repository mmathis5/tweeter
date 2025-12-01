"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const UserService_1 = require("../../model/service/UserService");
const DynamoDBFactory_1 = require("../../model/dao/DynamoDBFactory");
const handler = async (request) => {
    const daoFactory = new DynamoDBFactory_1.DynamoDBFactory();
    const userService = new UserService_1.UserService(daoFactory);
    const [user, token] = await userService.login("@" + request.alias, request.password);
    return {
        success: true,
        message: null,
        user: user.dto,
        token: token.dto
    };
};
exports.handler = handler;
