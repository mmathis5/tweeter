"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const UserService_1 = require("../../model/service/UserService");
const LambdaHandlerUtils_1 = require("../LambdaHandlerUtils");
const handlerImpl = async (request, daoFactory) => {
    const userService = new UserService_1.UserService(daoFactory);
    const user = await userService.getUser(request.token, request.alias);
    return {
        success: true,
        message: null,
        user: user.dto ?? null
    };
};
exports.handler = (0, LambdaHandlerUtils_1.withAuth)(handlerImpl);
